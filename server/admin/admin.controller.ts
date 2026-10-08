import {BadRequestException,Body,Controller,Get,NotFoundException,Param,Patch,Post,Query,Req,UseGuards} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";
import {User,Listing,Deal,Match,Community,Membership,Setting,Announcement,Report,AuditLog,EmailBatch} from "../common/schemas";import {AuthGuard,Roles} from "../common/roles";import {EmailService} from "../email/email.service";
const day=864e5;
@Controller("admin") @UseGuards(AuthGuard) @Roles("admin") export class AdminController{
 constructor(@InjectModel(User.name) private u:Model<User>,@InjectModel(Listing.name) private l:Model<Listing>,@InjectModel(Deal.name) private d:Model<Deal>,
  @InjectModel(Match.name) private m:Model<Match>,@InjectModel(Community.name) private c:Model<Community>,@InjectModel(Membership.name) private ms:Model<Membership>,
  @InjectModel(Setting.name) private st:Model<Setting>,@InjectModel(Announcement.name) private an:Model<Announcement>,@InjectModel(Report.name) private rp:Model<Report>,
  @InjectModel(AuditLog.name) private au:Model<AuditLog>,@InjectModel(EmailBatch.name) private eb:Model<EmailBatch>,private email:EmailService){}
 private log(r:any,action:string,target:string,after?:any){return this.au.create({actorId:r.user.sub,action,target,after});}
 @Get("dashboard") async dash(){
  const since=new Date(Date.now()-day),month=new Date(Date.now()-30*day);
  const [users,newToday,communities,live,disputes,pending,sales]=await Promise.all([this.u.countDocuments(),this.u.countDocuments({createdAt:{$gte:since}}),
   this.c.countDocuments({isActive:true}),this.m.countDocuments({status:"Live"}),this.m.countDocuments({status:"Disputed"}),this.l.countDocuments({status:"Pending"}),
   this.d.countDocuments({status:"Completed",updatedAt:{$gte:month}})]);
  const signups=await this.u.aggregate([{$match:{createdAt:{$gte:new Date(Date.now()-14*day)}}},{$group:{_id:{$dateToString:{format:"%Y-%m-%d",date:"$createdAt"}},n:{$sum:1}}},{$sort:{_id:1}}]);
  return {users,newToday,communities,live,disputes,pending,sales,signups};}
 @Get("users") users(@Query("q") q?:string){const f=q?{$or:[{username:new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i")},{email:q.toLowerCase()}]}:{};
  return this.u.find(f).select("-passwordHash -verifyCodeHash").sort({createdAt:-1}).limit(50).lean();}
 @Patch("users/:id") async user(@Req() r,@Param("id") id:string,@Body() b:{action:"suspend"|"ban"|"unban"|"verify"|"role";role?:string}){
  const upd:any={suspend:{status:"suspended"},ban:{status:"banned"},unban:{status:"active"},verify:{emailVerified:true},role:{role:b.role}}[b.action];
  if(!upd)throw new BadRequestException();if(b.action==="role"&&!["member","admin"].includes(b.role))throw new BadRequestException();
  const x=await this.u.findByIdAndUpdate(id,upd,{new:true}).select("-passwordHash");if(!x)throw new NotFoundException();
  await this.log(r,"user."+b.action,id,upd);return x;}
 @Get("settings") settings(){return this.st.findOneAndUpdate({key:"global"},{$setOnInsert:{key:"global"}},{upsert:true,new:true});}
 @Patch("settings") async setSettings(@Req() r,@Body() b:Partial<Setting>){
  const {autoApproveMatches,appealWindowHours,maintenanceMode,paymentInstructions}=b;
  const x=await this.st.findOneAndUpdate({key:"global"},{autoApproveMatches,appealWindowHours,maintenanceMode,paymentInstructions},{upsert:true,new:true});await this.log(r,"settings.update","global",b);return x;}
 @Post("announcements") async announce(@Req() r,@Body() b:{title:string;body:string}){const a=await this.an.create(b);await this.log(r,"announcement.create",String(a._id));return a;}
 @Get("reports") reports(){return this.rp.find({status:"open"}).sort({createdAt:-1}).limit(100).lean();}
 @Patch("reports/:id") resolve(@Param("id") id:string,@Body() b:{resolution:string}){return this.rp.findByIdAndUpdate(id,{status:"resolved",resolution:b.resolution},{new:true});}
 @Get("audit") audit(){return this.au.find().sort({createdAt:-1}).limit(200).lean();}
 // Email Centre
 private async recipients(a:any):Promise<string[]>{
  let f:any={status:"active"};
  switch(a.type){
   case "verified":f.emailVerified=true;break;
   case "inactive":f.$or=[{lastLoginAt:{$lt:new Date(Date.now()-30*day)}},{lastLoginAt:{$exists:false}}];break;
   case "sellers":f._id={$in:await this.l.distinct("sellerId")};break;
   case "buyers":f._id={$in:await this.d.distinct("buyerId")};break;
   case "community":f._id={$in:await this.ms.distinct("userId",{communityId:a.communityId})};break;
   case "users":f._id={$in:a.userIds||[]};break;
   case "all":break;default:throw new BadRequestException("Unknown audience");}
  if(a.type!=="users")f.marketingOptOut={$ne:true};
  return (await this.u.find(f).select("email").lean()).map((x:any)=>x.email);}
 @Post("email/send") async send(@Req() r,@Body() b:{audience:any;subject:string;heading:string;body:string;ctaLabel?:string;ctaUrl?:string;scheduleAt?:string}){
  if(!b.subject||!b.body)throw new BadRequestException("Subject and body required");
  const to=await this.recipients(b.audience);if(!to.length)throw new BadRequestException("No recipients");
  const at=b.scheduleAt?+new Date(b.scheduleAt):Date.now();
  const batch=await this.eb.create({sentBy:r.user.sub,subject:b.subject,audience:b.audience,recipientCount:to.length,scheduledAt:new Date(at)});
  await this.email.bulk(String(batch._id),to,b.subject,{heading:b.heading||b.subject,body:b.body,cta:b.ctaLabel?{label:b.ctaLabel,url:b.ctaUrl}:undefined},at);
  await this.log(r,"email.send",String(batch._id),{recipients:to.length});return batch;}
 @Post("email/test") async test(@Body() b:{to:string;subject:string;heading:string;body:string}){await this.email.send(b.to,"[Test] "+b.subject,{heading:b.heading,body:b.body});return {ok:true};}
 @Get("email/history") history(){return this.eb.find().sort({createdAt:-1}).limit(50).lean();}
}
