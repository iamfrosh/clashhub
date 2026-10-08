import {BadRequestException,Body,Controller,Delete,ForbiddenException,Get,NotFoundException,Param,Patch,Post,Query,Req,UseGuards} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";
import {Listing,AuditLog} from "../common/schemas";import {AuthGuard,Roles} from "../common/roles";import {encrypt,decrypt} from "../common/crypto";import {User} from "../common/schemas";import {NotificationsService} from "../notifications/notifications.service";import {EmailService} from "../email/email.service";
// Public serializer: never exposes sellerId or credentials.
const pub=(l:any)=>({id:l._id,game:l.gameId?.name,gameId:l.gameId?._id||l.gameId,title:l.title,description:l.description,price:l.price,images:l.images,status:l.status,featured:l.featured,createdAt:l.createdAt});
@Controller("listings") export class ListingsController{
 constructor(@InjectModel(Listing.name) private m:Model<Listing>,@InjectModel(AuditLog.name) private audit:Model<AuditLog>,@InjectModel(User.name) private users:Model<User>,private notes:NotificationsService,private email:EmailService){}
 @Get() async list(@Query("game") game?:string,@Query("max") max?:string){
  const q:any={status:{$in:["Approved","Reserved"]}};if(game)q.gameId=game;if(max)q.price={$lte:+max};
  return (await this.m.find(q).populate("gameId","name").sort({featured:-1,createdAt:-1}).limit(40).lean()).map(pub);}
 @Get("my/listings") @UseGuards(AuthGuard) async mine(@Req() r){
  return (await this.m.find({sellerId:r.user.sub,status:{$ne:"Removed"}}).populate("gameId","name").sort({createdAt:-1}).lean()).map((l:any)=>({...pub(l),views:l.views,rejectReason:l.rejectReason}));}
 @Get(":id") async one(@Param("id") id:string){
  const l=await this.m.findOneAndUpdate({_id:id,status:{$in:["Approved","Reserved"]}},{$inc:{views:1}},{new:true}).populate("gameId","name").lean();
  if(!l)throw new NotFoundException("Listing unavailable");return pub(l);}
 // Seller edits: allowed unless a deal is in progress or sold; any edit sends the listing back to Pending review.
 @UseGuards(AuthGuard) @Patch(":id") async edit(@Req() r,@Param("id") id:string,@Body() b:any){
  const l:any=await this.m.findOne({_id:id,sellerId:r.user.sub});if(!l)throw new NotFoundException();
  if(["Reserved","Sold","Removed"].includes(l.status))throw new ForbiddenException("This listing can no longer be edited");
  const u:any={status:"Pending",rejectReason:undefined};
  if(b.title)u.title=String(b.title).slice(0,120);if(b.description!=null)u.description=String(b.description).slice(0,2000);if(b.price>0)u.price=Number(b.price);
  return pub(await this.m.findByIdAndUpdate(id,u,{new:true}).lean());}
 @UseGuards(AuthGuard) @Delete(":id") async remove(@Req() r,@Param("id") id:string){
  const x=await this.m.updateOne({_id:id,sellerId:r.user.sub,status:{$nin:["Reserved","Sold"]}},{status:"Removed"});
  if(!x.modifiedCount)throw new ForbiddenException("Cannot delete this listing");return {ok:true};}
 @UseGuards(AuthGuard) @Post() async create(@Req() r,@Body() b:any){
  if(!r.user.verified)throw new ForbiddenException("Verify your email first");
  if(!b.credentials||!b.title||!(b.price>0)||!b.gameId)throw new BadRequestException("Fill in all required fields");
  if(await this.m.countDocuments({sellerId:r.user.sub,createdAt:{$gte:new Date(Date.now()-864e5)}})>=3)throw new BadRequestException("Daily listing limit reached");
  const credentials=b.credentials;const rest={gameId:b.gameId,title:String(b.title).slice(0,120),description:String(b.description||"").slice(0,2000),price:Number(b.price),images:(b.images||[]).slice(0,6)};
  const l=await this.m.create({...rest,sellerId:r.user.sub,encryptedCredentials:encrypt(credentials),status:"Pending"});return pub(l);}
 @UseGuards(AuthGuard) @Roles("admin") @Get("admin/all") all(@Query("status") s?:string){
  return this.m.find(s?{status:s}:{}).select("+sellerId").populate("gameId","name").populate("sellerId","username email").sort({createdAt:-1}).limit(100).lean();}
 // Credentials are decrypted only on explicit admin request, and every view is audit-logged.
 @UseGuards(AuthGuard) @Roles("admin") @Get("admin/:id/credentials") async creds(@Req() r,@Param("id") id:string){
  const l:any=await this.m.findById(id).select("+encryptedCredentials");if(!l)throw new NotFoundException();
  await this.audit.create({actorId:r.user.sub,action:"listing.credentials.view",target:id});return {credentials:decrypt(l.encryptedCredentials)};}
 @UseGuards(AuthGuard) @Roles("admin") @Patch("admin/:id/feature") async feature(@Req() r,@Param("id") id:string,@Body() b:{featured:boolean}){
  await this.m.updateOne({_id:id},{featured:!!b.featured});await this.audit.create({actorId:r.user.sub,action:"listing.feature",target:id,after:{featured:!!b.featured}});return {ok:true};}
 @UseGuards(AuthGuard) @Roles("admin") @Get("admin/pending") pending(){
  return this.m.find({status:"Pending"}).select("+sellerId").lean();}
 @UseGuards(AuthGuard) @Roles("admin") @Patch("admin/:id/status") async setStatus(@Req() r,@Param("id") id:string,@Body() b:{status:string;reason?:string}){
  const before=await this.m.findById(id).lean();
  const after=await this.m.findByIdAndUpdate(id,{status:b.status,rejectReason:b.reason},{new:true}).lean();
  await this.audit.create({actorId:r.user.sub,action:"listing.status",target:id,before:{status:before.status},after:{status:after.status}});if(["Approved","Rejected"].includes(b.status)){const l2:any=await this.m.findById(id).select("+sellerId");const su:any=await this.users.findById(l2.sellerId);
  await this.notes.create(l2.sellerId,"listing_status",{listingId:id,status:b.status});if(su)await this.email.listingStatus(su.email,l2.title,b.status,b.reason);}
  return pub(after);}
}
