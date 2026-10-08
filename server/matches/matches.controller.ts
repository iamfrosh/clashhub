import {BadRequestException,Body,Controller,ForbiddenException,Get,NotFoundException,Param,Patch,Post,Query,Req,UseGuards} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";
import {Match,Membership,Setting,User,AuditLog,Report} from "../common/schemas";import {AuthGuard,Roles} from "../common/roles";import {NotificationsService} from "../notifications/notifications.service";import {EmailService} from "../email/email.service";
const MIN_REFEREE_AGE_MS=7*864e5;
@Controller("matches") @UseGuards(AuthGuard) export class MatchesController{
 constructor(@InjectModel(Match.name) private m:Model<Match>,@InjectModel(Membership.name) private ms:Model<Membership>,
  @InjectModel(Setting.name) private st:Model<Setting>,@InjectModel(User.name) private users:Model<User>,@InjectModel(AuditLog.name) private audit:Model<AuditLog>,@InjectModel(Report.name) private reports:Model<Report>,private notes:NotificationsService,private email:EmailService){}
 private settings(){return this.st.findOneAndUpdate({key:"global"},{$setOnInsert:{key:"global"}},{upsert:true,new:true});}
 // Wizard submit: every field required; referee must be a community member and not a participant.
 @Post() async create(@Req() r,@Body() b:any){
  if(!r.user.verified)throw new ForbiddenException("Verify your email first");
  const need=["communityId","type","participants","scheduledAt","rules","refereeId"];
  if(need.some(k=>!b[k]||(Array.isArray(b[k])&&!b[k].length)))throw new BadRequestException("Complete all fields");
  if(b.type==="group"&&(b.teams?.length!==2))throw new BadRequestException("Two teams required");
  if(new Date(b.scheduledAt)<=new Date())throw new BadRequestException("Pick a future time");
  if(b.participants.map(String).includes(String(b.refereeId)))throw new BadRequestException("Referee cannot be a participant");
  const ref=await this.users.findById(b.refereeId);
  if(!ref||Date.now()-+new Date((ref as any).createdAt)<MIN_REFEREE_AGE_MS)throw new BadRequestException("Referee account too new");
  if(!(await this.ms.exists({userId:b.refereeId,communityId:b.communityId})))throw new BadRequestException("Referee must be a community member");
  const m=await this.m.create({...b,creatorId:r.user.sub,status:"Awaiting referee",refereeStatus:"pending",refereeRequestedAt:new Date()});
  await this.notes.create(b.refereeId,"referee_request",{matchId:m._id});
  await this.email.send((ref as any).email,"Referee request",{heading:"You were picked as a referee",body:"Open your Referee Dashboard to accept or decline this match.",cta:{label:"Open dashboard",url:process.env.CLIENT_URL+"/referee"}});
  return m;}
 @Get() list(@Query("communityId") cid:string){return this.m.find({communityId:cid,status:{$nin:["Draft","Awaiting referee","Pending admin"]}}).sort({scheduledAt:-1}).limit(50).lean();}
 // Referee dashboard data
 @Get("mine") myMatches(@Req() r){return this.m.find({participants:r.user.sub}).populate("participants","username").sort({scheduledAt:-1}).limit(100).lean();}
 // Referee cannot edit a result; a genuine error goes to admin as a correction request.
 @Post(":id/correction") async correction(@Req() r,@Param("id") id:string,@Body() b:{reason:string}){
  const m=await this.m.findOne({_id:id,refereeId:r.user.sub,result:{$exists:true}});if(!m)throw new ForbiddenException();
  await this.reports.create({targetType:"match",targetId:m._id,reporterId:r.user.sub,reason:"Correction request: "+String(b.reason||"").slice(0,500)});return {ok:true};}
 @Get("referee/mine") mine(@Req() r){return this.m.find({refereeId:r.user.sub}).sort({scheduledAt:-1}).lean();}
 @Post(":id/referee") async respond(@Req() r,@Param("id") id:string,@Body() b:{accept:boolean}){
  const s=await this.settings();
  const upd=b.accept?{refereeStatus:"accepted",status:s.autoApproveMatches?"Scheduled":"Pending admin"}:{refereeStatus:"declined",status:"Draft",$unset:{refereeId:1}};
  const m=await this.m.findOneAndUpdate({_id:id,refereeId:r.user.sub,refereeStatus:"pending"},upd,{new:true});
  if(!m)throw new NotFoundException("No pending request");return m;}
 // One submission only: the filter makes the write atomic, so a second call matches nothing.
 @Post(":id/result") async result(@Req() r,@Param("id") id:string,@Body() b:{scores:number[];winnerId?:string;winnerTeam?:number}){
  const s=await this.settings();const now=new Date();
  const m:any=await this.m.findOneAndUpdate(
   {_id:id,refereeId:r.user.sub,result:{$exists:false},status:{$in:["Scheduled","Live","Awaiting result"]},scheduledAt:{$lte:now}},
   {status:"Completed",result:{scores:b.scores,outcome:(b.winnerId||b.winnerTeam!=null)?"win":"draw",winnerIds:b.winnerTeam!=null?((await this.m.findById(id)) as any)?.teams?.[b.winnerTeam]?.members||[]:(b.winnerId?[b.winnerId]:[]),submittedAt:now},appealDeadline:new Date(+now+s.appealWindowHours*36e5)},{new:true});
  if(!m)throw new ForbiddenException("Result not allowed or already submitted");
  await this.applyStats(m,1);return m;}
 private async applyStats(m:any,dir:1|-1){
  const g="stats."+m.communityId,{winnerIds=[],outcome}=m.result;
  const ops=m.participants.map((p:any)=>this.users.updateOne({_id:p},{$inc:{[g+(outcome==="draw"?".draws":winnerIds.map(String).includes(String(p))?".wins":".losses")]:dir}}));
  await Promise.all(ops);}
 @Post(":id/appeal") async appeal(@Req() r,@Param("id") id:string,@Body() b:{statement:string;evidence:string[]}){
  const m=await this.m.findOneAndUpdate({_id:id,participants:r.user.sub,status:"Completed",appealDeadline:{$gte:new Date()}},
   {status:"Disputed",appeal:{by:r.user.sub,statement:b.statement,evidence:b.evidence||[]}},{new:true});
  if(!m)throw new ForbiddenException("Appeal window closed");return m;}
 @Roles("admin") @Get("admin/disputes") disputes(){return this.m.find({status:"Disputed"}).populate("participants","username").populate("refereeId","username").sort({updatedAt:-1}).lean();}
 @Roles("admin") @Get("admin/pending") pendingQ(){return this.m.find({status:"Pending admin"}).populate("participants","username").sort({createdAt:-1}).lean();}
 @Roles("admin") @Patch("admin/:id/approve") approve(@Param("id") id:string){return this.m.findOneAndUpdate({_id:id,status:"Pending admin"},{status:"Scheduled"},{new:true});}
 // Final admin decision on a dispute: confirm, correct (reverses old stats, applies new) or void.
 @Roles("admin") @Patch("admin/:id/dispute") async decide(@Req() r,@Param("id") id:string,@Body() b:{action:"confirm"|"correct"|"void";note:string;scores?:number[];winnerId?:string}){
  const m:any=await this.m.findOne({_id:id,status:"Disputed"});if(!m)throw new NotFoundException();
  const before=m.result;
  if(b.action!=="confirm")await this.applyStats(m,-1);
  if(b.action==="void")m.status="Voided";
  else{if(b.action==="correct")m.result={scores:b.scores,outcome:b.winnerId?"win":"draw",winnerIds:b.winnerId?[b.winnerId]:[],submittedAt:new Date()};m.status="Completed";m.appealDeadline=new Date(0);}
  m.adminDecision=b.note;await m.save();if(b.action==="correct")await this.applyStats(m,1);
  await this.audit.create({actorId:r.user.sub,action:"dispute."+b.action,target:id,before,after:m.result});return m;}
}
