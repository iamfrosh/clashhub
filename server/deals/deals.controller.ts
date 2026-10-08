import {BadRequestException,Body,Controller,ForbiddenException,Get,NotFoundException,Param,Patch,Post,Req,UseGuards} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";
import {Deal,Listing,Conversation,Message,User,AuditLog} from "../common/schemas";import {AuthGuard,Roles} from "../common/roles";import {EmailService} from "../email/email.service";
const STATUSES=["Inquiry","Payment pending","Payment received","Delivering","Completed","Cancelled","Disputed"];
@Controller("deals") @UseGuards(AuthGuard) export class DealsController{
 constructor(@InjectModel(Deal.name) private deals:Model<Deal>,@InjectModel(Listing.name) private listings:Model<Listing>,
  @InjectModel(Conversation.name) private convs:Model<Conversation>,@InjectModel(Message.name) private msgs:Model<Message>,
  @InjectModel(User.name) private users:Model<User>,@InjectModel(AuditLog.name) private audit:Model<AuditLog>,private email:EmailService){}
 // Buyer taps Buy / Message Admin: reuse or create the private chat with admin, tied to the listing, opening with a listing card.
 @Post("inquire") async inquire(@Req() r,@Body() b:{listingId:string}){
  if(!r.user.verified)throw new ForbiddenException("Verify your email first");
  const l:any=await this.listings.findOne({_id:b.listingId,status:{$in:["Approved","Reserved"]}}).select("+sellerId");
  if(!l)throw new NotFoundException("Listing unavailable");
  if(String(l.sellerId)===r.user.sub)throw new BadRequestException("You cannot buy your own listing");
  const admin=await this.users.findOne({role:"admin"});
  let deal:any=await this.deals.findOne({listingId:l._id,buyerId:r.user.sub,status:{$nin:["Completed","Cancelled"]}});
  if(!deal)deal=await this.deals.create({listingId:l._id,buyerId:r.user.sub,sellerId:l.sellerId,amount:l.price,history:[{status:"Inquiry",at:new Date()}]});
  let c:any=await this.convs.findOne({type:"buyerAdmin",dealId:deal._id});
  if(!c){c=await this.convs.create({type:"buyerAdmin",participants:[admin._id,r.user.sub],listingId:l._id,dealId:deal._id,lastMessageAt:new Date()});
   await this.msgs.create({conversationId:c._id,senderId:r.user.sub,type:"listingCard",text:JSON.stringify({id:l._id,title:l.title,price:l.price,image:l.images?.[0]}),readBy:[r.user.sub]});}
  return {conversationId:c._id,dealId:deal._id};}
 @Get("mine") mine(@Req() r){return this.deals.find({buyerId:r.user.sub}).select("-sellerId").populate("listingId","title images").sort({createdAt:-1}).lean();}
 // Admin only: status changes are logged; Reserved/Sold/Approved sync to the listing.
 @Roles("admin") @Get("admin/all") async all(){
  const ds:any[]=await this.deals.find().populate("buyerId","username").populate("sellerId","username").populate("listingId","title").sort({createdAt:-1}).limit(100).lean();
  const cs:any[]=await this.convs.find({dealId:{$in:ds.map(d=>d._id)},type:"buyerAdmin"}).select("dealId").lean();
  const m=Object.fromEntries(cs.map(c=>[String(c.dealId),c._id]));return ds.map(d=>({...d,chatId:m[String(d._id)]}));}
 @Roles("admin") @Patch("admin/:id/fee") async fee(@Req() r,@Param("id") id:string,@Body() b:{fee:number}){
  const d=await this.deals.findByIdAndUpdate(id,{fee:Math.max(0,Number(b.fee)||0)},{new:true});await this.audit.create({actorId:r.user.sub,action:"deal.fee",target:id,after:{fee:d.fee}});return d;}
 @Roles("admin") @Patch("admin/:id/status") async setStatus(@Req() r,@Param("id") id:string,@Body() b:{status:string}){
  if(!STATUSES.includes(b.status))throw new BadRequestException("Bad status");
  const d:any=await this.deals.findById(id);if(!d)throw new NotFoundException();
  const from=d.status;d.status=b.status;d.history.push({status:b.status,by:r.user.sub,at:new Date()});await d.save();
  const map:Record<string,string>={"Payment received":"Reserved",Delivering:"Reserved",Completed:"Sold",Cancelled:"Approved"};
  if(map[b.status])await this.listings.updateOne({_id:d.listingId},{status:map[b.status]});
  if(b.status==="Completed"){const [buyer,seller,l]:any=await Promise.all([this.users.findById(d.buyerId),this.users.findById(d.sellerId),this.listings.findById(d.listingId)]);
   await this.email.receipt(buyer.email,l.title,d.amount);await this.email.receipt(seller.email,l.title,d.amount);}
  await this.audit.create({actorId:r.user.sub,action:"deal.status",target:id,before:{status:from},after:{status:b.status}});return d;}
 // Admin opens the separate Admin and Seller chat for this deal.
 @Roles("admin") @Post("admin/:id/seller-chat") async sellerChat(@Req() r,@Param("id") id:string){
  const d:any=await this.deals.findById(id);
  return this.convs.findOneAndUpdate({type:"sellerAdmin",dealId:d._id},{$setOnInsert:{type:"sellerAdmin",participants:[r.user.sub,d.sellerId],listingId:d.listingId,dealId:d._id}},{upsert:true,new:true});}
}
