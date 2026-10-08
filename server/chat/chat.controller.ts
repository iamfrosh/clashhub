import {BadRequestException,Body,Controller,Delete,ForbiddenException,Get,HttpException,NotFoundException,Param,Post,Query,Req,UseGuards} from "@nestjs/common";import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";
import {Conversation,Membership,Message,Report} from "../common/schemas";import {AuthGuard} from "../common/roles";import {violates} from "./chat.filter";
@Controller("chat") @UseGuards(AuthGuard) export class ChatController{
 constructor(@InjectModel(Conversation.name) private cv:Model<Conversation>,@InjectModel(Message.name) private mg:Model<Message>,@InjectModel(Membership.name) private ms:Model<Membership>,@InjectModel(Report.name) private rp:Model<Report>){}
 private async canMod(r:any,communityId:any){return r.user.role==="admin"||!!(await this.ms.exists({userId:r.user.sub,communityId,role:"moderator"}));}
 // Access: admin, community members, or the conversation's participants.
 private async access(r:any,id:string){const c:any=await this.cv.findById(id);if(!c)throw new NotFoundException();if(r.user.role==="admin")return c;
  const ok=c.type==="community"?!!(await this.ms.exists({userId:r.user.sub,communityId:c.communityId})):c.participants.map(String).includes(r.user.sub);
  if(!ok)throw new ForbiddenException();return c;}
 @Get("community/:cid/room") async room(@Req() r,@Param("cid") cid:string){
  if(r.user.role!=="admin"&&!(await this.ms.exists({userId:r.user.sub,communityId:cid})))throw new ForbiddenException("Join first");
  const c:any=await this.cv.findOneAndUpdate({type:"community",communityId:cid},{$setOnInsert:{type:"community",communityId:cid,participants:[]}},{upsert:true,new:true});
  return {conversationId:c._id,pinned:await this.mg.find({conversationId:c._id,pinned:true,deleted:false}).lean(),messages:(await this.mg.find({conversationId:c._id,deleted:false}).sort({_id:-1}).limit(50).lean()).reverse()};}
 // History (?before=) and polling (?after=, also returns recently deleted ids).
 @Get("conversations/:id/messages") async history(@Req() r,@Param("id") id:string,@Query("before") before?:string,@Query("after") after?:string){
  await this.access(r,id);
  if(after){const messages=await this.mg.find({conversationId:id,_id:{$gt:after},deleted:false}).sort({_id:1}).limit(100).lean();
   const deleted=(await this.mg.find({conversationId:id,deleted:true}).sort({_id:-1}).limit(50).select("_id").lean()).map((m:any)=>String(m._id));return {messages,deleted};}
  const f:any={conversationId:id,deleted:false};if(before)f._id={$lt:before};
  return {messages:(await this.mg.find(f).sort({_id:-1}).limit(50).lean()).reverse(),deleted:[]};}
 @Post("conversations/:id/send") async send(@Req() r,@Param("id") id:string,@Body() b:{text?:string;replyTo?:string;attachments?:string[]}){
  const c=await this.access(r,id);const text=(b.text||"").trim();const att=(b.attachments||[]).filter(a=>String(a).startsWith(process.env.CDN_URL+"/")).slice(0,4);
  if((!text&&!att.length)||text.length>2000)throw new BadRequestException("Message could not be sent");
  if(await this.mg.countDocuments({senderId:r.user.sub,createdAt:{$gte:new Date(Date.now()-10000)}})>=5)throw new HttpException("Slow down a little.",429);
  if(c.type==="community"){const mem:any=await this.ms.findOne({userId:r.user.sub,communityId:c.communityId});
   if(mem?.mutedUntil>new Date())throw new ForbiddenException("You are muted in this community.");
   if(r.user.role!=="admin"&&violates(text))throw new BadRequestException("Phone numbers and links are not allowed here.");}
  const m=await this.mg.create({conversationId:id,senderId:r.user.sub,text,replyTo:b.replyTo,attachments:att,readBy:[r.user.sub]});
  await this.cv.updateOne({_id:id},{lastMessageAt:new Date()});return m;}
 @Post("conversations/:id/read") async read(@Req() r,@Param("id") id:string){await this.access(r,id);await this.mg.updateMany({conversationId:id,readBy:{$ne:r.user.sub}},{$addToSet:{readBy:r.user.sub}});return {ok:true};}
 @Get("conversations") async mine(@Req() r){
  const cs:any[]=await this.cv.find({type:{$in:["buyerAdmin","sellerAdmin"]},participants:r.user.sub}).sort({lastMessageAt:-1}).limit(50).lean();
  return Promise.all(cs.map(async c=>({...c,kind:c.type==="buyerAdmin"?"Buying":"Selling",card:await this.mg.findOne({conversationId:c._id,type:"listingCard"}).lean(),last:await this.mg.findOne({conversationId:c._id}).sort({_id:-1}).lean()})));}
 @Get("admin/inbox") async inbox(@Req() r){if(r.user.role!=="admin")throw new ForbiddenException();
  const cs:any[]=await this.cv.find({type:{$in:["buyerAdmin","sellerAdmin"]}}).sort({lastMessageAt:-1}).limit(100).lean();
  return Promise.all(cs.map(async c=>({...c,card:await this.mg.findOne({conversationId:c._id,type:"listingCard"}).lean(),last:await this.mg.findOne({conversationId:c._id}).sort({_id:-1}).lean(),
   unread:await this.mg.countDocuments({conversationId:c._id,readBy:{$ne:r.user.sub}})})));}
 private async modTarget(r:any,id:string){const m:any=await this.mg.findById(id);if(!m)throw new NotFoundException();
  const c:any=await this.cv.findById(m.conversationId);if(c.type!=="community"||!(await this.canMod(r,c.communityId)))throw new ForbiddenException();return m;}
 @Post("messages/:id/pin") async pin(@Req() r,@Param("id") id:string){const m=await this.modTarget(r,id);m.pinned=!m.pinned;await m.save();return m;}
 @Delete("messages/:id") async del(@Req() r,@Param("id") id:string){const m=await this.modTarget(r,id);m.deleted=true;await m.save();return {ok:true};}
 @Post("community/:cid/mute/:uid") async mute(@Req() r,@Param("cid") cid:string,@Param("uid") uid:string,@Body() b:{minutes:number}){
  if(!(await this.canMod(r,cid)))throw new ForbiddenException();
  await this.ms.updateOne({communityId:cid,userId:uid},{mutedUntil:new Date(Date.now()+Math.min(b.minutes||60,43200)*6e4)});return {ok:true};}
 @Post("report") async report(@Req() r,@Body() b:{targetType:"message"|"listing"|"user";targetId:string;reason:string}){
  return this.rp.create({...b,reporterId:r.user.sub,reason:(b.reason||"").slice(0,500)});}
}
