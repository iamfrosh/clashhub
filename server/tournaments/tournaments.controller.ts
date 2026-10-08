import {BadRequestException,Body,Controller,ForbiddenException,Get,NotFoundException,Param,Patch,Post,Query,Req,UseGuards} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";import {Tournament,Membership,User} from "../common/schemas";import {AuthGuard,Roles} from "../common/roles";
import {advance,roundRobin,singleElimination} from "./bracket";
@Controller("tournaments") export class TournamentsController{
 constructor(@InjectModel(Tournament.name) private t:Model<Tournament>,@InjectModel(Membership.name) private ms:Model<Membership>,@InjectModel(User.name) private users:Model<User>){}
 @Get() list(@Query("status") s?:string){return this.t.find(s?{status:s}:{}).sort({startsAt:1}).limit(50).lean();}
 @UseGuards(AuthGuard) @Get("my/all") mine(@Req() r){return this.t.find({participants:r.user.sub}).sort({startsAt:-1}).limit(50).lean();}
 @Get(":id") async one(@Param("id") id:string){
  const t:any=await this.t.findById(id).lean();if(!t)throw new NotFoundException();
  const ids=new Set<string>(t.participants.map(String));
  const us:any[]=await this.users.find({_id:{$in:[...ids,String(t.organizerId)]}}).select("username").lean();
  return {...t,names:Object.fromEntries(us.map(u=>[String(u._id),u.username]))};}
 @UseGuards(AuthGuard) @Post() async create(@Req() r,@Body() b:any){
  if(!r.user.verified)throw new ForbiddenException("Verify your email first");
  if(!["single_elimination","round_robin"].includes(b.format))throw new BadRequestException("Format not supported yet");
  if(!(await this.ms.exists({userId:r.user.sub,communityId:b.communityId})))throw new ForbiddenException("Join the community first");
  return this.t.create({...b,organizerId:r.user.sub,status:"Registration",participants:[],bracket:[]});}
 // Atomic join: slot limit enforced in the filter (participants.slots-1 exists means room left).
 @UseGuards(AuthGuard) @Post(":id/join") async join(@Req() r,@Param("id") id:string){
  const t=await this.t.findById(id);if(!t)throw new NotFoundException();
  const res=await this.t.updateOne({_id:id,status:"Registration",participants:{$ne:r.user.sub},[`participants.${t.slots-1}`]:{$exists:false}},{$push:{participants:r.user.sub}});
  if(!res.modifiedCount)throw new BadRequestException("Registration closed, full, or already joined");return {ok:true};}
 // Organizer or admin closes registration; the bracket is drawn once.
 @UseGuards(AuthGuard) @Post(":id/start") async start(@Req() r,@Param("id") id:string){
  const t:any=await this.t.findById(id);if(!t)throw new NotFoundException();
  if(String(t.organizerId)!==r.user.sub&&r.user.role!=="admin")throw new ForbiddenException();
  if(t.status!=="Registration"||t.participants.length<2)throw new BadRequestException("Need 2+ players in Registration");
  const ids=t.participants.map(String);
  t.bracket=t.format==="round_robin"?roundRobin(ids):singleElimination(ids);t.status="Live";t.markModified("bracket");await t.save();return t;}
 // Organizer, admin or an assigned tournament referee reports a match result; winners advance automatically.
 @UseGuards(AuthGuard) @Post(":id/result") async result(@Req() r,@Param("id") id:string,@Body() b:{round:number;index:number;winnerId:string}){
  const t:any=await this.t.findById(id);if(!t||t.status!=="Live")throw new NotFoundException();
  const ok=String(t.organizerId)===r.user.sub||r.user.role==="admin"||t.refereeIds.map(String).includes(r.user.sub);
  if(!ok)throw new ForbiddenException();
  const m=t.bracket[b.round]?.matches[b.index];
  if(!m||m.winner||![m.a,m.b].includes(b.winnerId))throw new BadRequestException("Invalid or already reported");
  if(t.format==="single_elimination"){advance(t.bracket,b.round,b.index,b.winnerId);
   const last=t.bracket[t.bracket.length-1].matches[0];if(last.winner){t.status="Completed";t.championId=last.winner;}}
  else{m.winner=b.winnerId;if(t.bracket.every((x:any)=>x.matches.every((y:any)=>y.winner))){t.status="Completed";}}
  t.markModified("bracket");await t.save();return t;}
 @UseGuards(AuthGuard) @Roles("admin") @Patch(":id") edit(@Param("id") id:string,@Body() b:any){return this.t.findByIdAndUpdate(id,b,{new:true});}
}
