import {BadRequestException,Body,Controller,Delete,Get,NotFoundException,Param,Patch,Post,Req,UseGuards} from "@nestjs/common";import {hash as ah,verify as av} from "@node-rs/argon2";import {randomBytes,randomInt} from "crypto";import {EmailService} from "../email/email.service";import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";
import {Community,Deal,Listing,Match,Membership,Tournament,User} from "../common/schemas";import {AuthGuard} from "../common/roles";
// Finish label from a completed single-elimination bracket.
const label=(t:any,id:string)=>{
 if(String(t.championId)===id)return "Champion";const R=t.bracket||[];if(t.format!=="single_elimination")return "Participant";
 for(let i=R.length-1;i>=0;i--){const lost=R[i].matches.some((m:any)=>m.winner&&(m.a===id||m.b===id)&&m.winner!==id);
  if(lost)return i===R.length-1?"Runner-up":i===R.length-2?"Semi-finalist":"Participant";}
 return "Participant";};
@Controller("users") export class UsersController{
 constructor(@InjectModel(User.name) private u:Model<User>,@InjectModel(Community.name) private c:Model<Community>,@InjectModel(Membership.name) private ms:Model<Membership>,
  @InjectModel(Tournament.name) private t:Model<Tournament>,@InjectModel(Match.name) private m:Model<Match>,@InjectModel(Deal.name) private d:Model<Deal>,@InjectModel(Listing.name) private l:Model<Listing>,private email:EmailService){}
 @UseGuards(AuthGuard) @Get("me") me(@Req() r){return this.u.findById(r.user.sub).select("username email avatarUrl bio emailVerified role marketingOptOut blocked").populate("blocked","username").lean();}
 @UseGuards(AuthGuard) @Patch("me") async patch(@Req() r,@Body() b:{bio?:string;avatarUrl?:string}){
  const upd:any={};if(b.bio!=null)upd.bio=String(b.bio).slice(0,300);
  if(b.avatarUrl){if(!b.avatarUrl.startsWith(process.env.CDN_URL+"/avatar/"))throw new BadRequestException("Invalid avatar");upd.avatarUrl=b.avatarUrl;}
  return this.u.findByIdAndUpdate(r.user.sub,upd,{new:true}).select("username avatarUrl bio");}

 private async me_(id:string,pw:string){const u:any=await this.u.findById(id);if(!u||!(await av(u.passwordHash,pw||"")))throw new BadRequestException("Password is wrong");return u;}
 // Data export (GDPR access request): everything tied to the account, never credentials or other users' identities.
 @UseGuards(AuthGuard) @Get("me/export") async exp(@Req() r){
  const id=r.user.sub;const [profile,communities,matches,purchases,listings]=await Promise.all([
   this.u.findById(id).select("username email avatarUrl bio createdAt stats marketingOptOut").lean(),this.ms.find({userId:id}).select("communityId role createdAt").lean(),
   this.m.find({participants:id}).select("type scheduledAt status result").lean(),this.d.find({buyerId:id}).select("listingId amount status createdAt").lean(),this.l.find({sellerId:id}).select("title price status createdAt").lean()]);
  return {exportedAt:new Date(),profile,communities,matches,purchases,listings};}
 @UseGuards(AuthGuard) @Post("me/password") async pw(@Req() r,@Body() b:{current:string;next:string}){
  if(!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(b.next||""))throw new BadRequestException("Password needs at least 8 characters with letters and numbers");
  const u=await this.me_(r.user.sub,b.current);await this.u.updateOne({_id:u._id},{passwordHash:await ah(b.next)});return {ok:true};}
 // Email change requires the password and re-verification with a fresh 6-digit code.
 @UseGuards(AuthGuard) @Post("me/email") async em(@Req() r,@Body() b:{email:string;password:string}){
  const email=(b.email||"").toLowerCase().trim();if(!/^\S+@\S+\.\S+$/.test(email))throw new BadRequestException("Enter a valid email");
  const u=await this.me_(r.user.sub,b.password);if(await this.u.exists({email,_id:{$ne:u._id}}))throw new BadRequestException("Email already in use");
  const code=String(randomInt(100000,999999));
  await this.u.updateOne({_id:u._id},{email,emailVerified:false,verifyCodeHash:await ah(code),verifyExpires:new Date(Date.now()+600000),verifyAttempts:0});
  await this.email.verification(email,code);return {ok:true,email};}
 @UseGuards(AuthGuard) @Patch("me/prefs") prefs(@Req() r,@Body() b:{marketingOptOut:boolean}){return this.u.findByIdAndUpdate(r.user.sub,{marketingOptOut:!!b.marketingOptOut},{new:true}).select("marketingOptOut");}
 @UseGuards(AuthGuard) @Post("me/block") async block(@Req() r,@Body() b:{username:string}){
  const t=await this.u.findOne({username:(b.username||"").toLowerCase()});if(!t||String(t._id)===r.user.sub)throw new NotFoundException("Player not found");
  await this.u.updateOne({_id:r.user.sub},{$addToSet:{blocked:t._id}});return {ok:true};}
 @UseGuards(AuthGuard) @Delete("me/block/:username") async unblock(@Req() r,@Param("username") n:string){
  const t=await this.u.findOne({username:n.toLowerCase()});if(t)await this.u.updateOne({_id:r.user.sub},{$pull:{blocked:t._id}});return {ok:true};}
 // Account deletion anonymises the user; matches, deals and audit history stay intact for dispute handling.
 @UseGuards(AuthGuard) @Delete("me") async del(@Req() r,@Body() b:{password:string}){
  const u=await this.me_(r.user.sub,b.password);
  await this.u.updateOne({_id:u._id},{$set:{username:"deleted_"+String(u._id).slice(-8),email:"deleted+"+u._id+"@invalid.local",status:"banned",passwordHash:await ah(randomBytes(16).toString("hex"))},$unset:{avatarUrl:1,bio:1}});return {ok:true};}
 // Public profile: never returns email or any private field.
 @Get(":username") async pub(@Param("username") n:string){
  const u:any=await this.u.findOne({username:n.toLowerCase(),status:"active"}).select("username avatarUrl bio stats createdAt").lean();if(!u)throw new NotFoundException();
  const id=String(u._id),keys=Object.keys(u.stats||{});
  const [mems,cs,ts,refereed]=await Promise.all([this.ms.find({userId:u._id}).populate("communityId","name slug").lean(),this.c.find({_id:{$in:keys}}).select("name").lean(),
   this.t.find({participants:u._id,status:"Completed"}).select("name bracket championId format").lean(),this.m.countDocuments({refereeId:u._id,status:"Completed"})]);
  const nm=Object.fromEntries(cs.map((x:any)=>[String(x._id),x.name]));
  const stats=keys.map(k=>{const s=u.stats[k],p=(s.wins||0)+(s.losses||0)+(s.draws||0);return {game:nm[k]||"Game",wins:s.wins||0,losses:s.losses||0,draws:s.draws||0,winRate:p?Math.round((s.wins||0)/p*100):0};});
  return {username:u.username,avatarUrl:u.avatarUrl,bio:u.bio,since:u.createdAt,stats,refereed,
   joined:mems.filter((x:any)=>x.communityId).map((x:any)=>({name:x.communityId.name,slug:x.communityId.slug})),tournaments:ts.map((x:any)=>({name:x.name,result:label(x,id)}))};}
}
