import {Body,Controller,ForbiddenException,Get,Param,Patch,Post,Req,UseGuards} from "@nestjs/common";import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";
import {Community,Membership} from "../common/schemas";import {AuthGuard,Roles} from "../common/roles";
@Controller("communities") export class CommunitiesController{
 constructor(@InjectModel(Community.name) private cs:Model<Community>,@InjectModel(Membership.name) private ms:Model<Membership>){}
 @Get() list(){return this.cs.find({isActive:true}).sort({memberCount:-1}).lean();}
 @Get(":slug") one(@Param("slug") s:string){return this.cs.findOne({slug:s,isActive:true}).lean();}
 @UseGuards(AuthGuard) @Post(":id/join") async join(@Req() r,@Param("id") id:string){
  if(!r.user.verified)throw new ForbiddenException("Verify your email first");
  const res=await this.ms.updateOne({userId:r.user.sub,communityId:id},{$setOnInsert:{role:"member"}},{upsert:true});
  if(res.upsertedCount)await this.cs.updateOne({_id:id},{$inc:{memberCount:1}});return {ok:true};}
 @UseGuards(AuthGuard) @Post(":id/leave") async leave(@Req() r,@Param("id") id:string){
  const d=await this.ms.deleteOne({userId:r.user.sub,communityId:id});if(d.deletedCount)await this.cs.updateOne({_id:id},{$inc:{memberCount:-1}});return {ok:true};}
 @UseGuards(AuthGuard) @Get(":id/members") async members(@Req() r,@Param("id") id:string){
  if(!(await this.ms.exists({userId:r.user.sub,communityId:id})))throw new ForbiddenException("Join first");
  return this.ms.find({communityId:id}).populate("userId","username avatarUrl").limit(200).lean();}
 @UseGuards(AuthGuard) @Roles("admin") @Post() create(@Body() b:any){return this.cs.create(b);}
 @UseGuards(AuthGuard) @Roles("admin") @Patch(":id") update(@Param("id") id:string,@Body() b:any){return this.cs.findByIdAndUpdate(id,b,{new:true});}
 @UseGuards(AuthGuard) @Roles("admin") @Post(":id/moderators/:userId") async mod(@Param("id") id:string,@Param("userId") u:string){
  await this.ms.updateOne({communityId:id,userId:u},{role:"moderator"});await this.cs.updateOne({_id:id},{$addToSet:{moderators:u}});return {ok:true};}
}
