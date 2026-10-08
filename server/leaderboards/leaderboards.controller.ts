import {Controller,Get,Query} from "@nestjs/common";import {InjectModel} from "@nestjs/mongoose";import {Model,Types} from "mongoose";import {Match,Tournament} from "../common/schemas";
@Controller("leaderboards") export class LeaderboardsController{
 constructor(@InjectModel(Match.name) private m:Model<Match>,@InjectModel(Tournament.name) private t:Model<Tournament>){}
 // GET /leaderboards?game=<communityId>&period=weekly|all
 @Get() async get(@Query("game") game?:string,@Query("period") period="all"){
  const match:any={status:"Completed","result.submittedAt":{$exists:true}};
  if(game)match.communityId=new Types.ObjectId(game);
  if(period==="weekly")match["result.submittedAt"]={$gte:new Date(Date.now()-7*864e5)};
  const rows=await this.m.aggregate([{$match:match},{$unwind:"$participants"},
   {$group:{_id:"$participants",played:{$sum:1},
    wins:{$sum:{$cond:[{$in:[{$toString:"$participants"},{$ifNull:["$result.winnerIds",[]]}]},1,0]}},
    draws:{$sum:{$cond:[{$eq:["$result.outcome","draw"]},1,0]}}}},
   {$addFields:{losses:{$subtract:["$played",{$add:["$wins","$draws"]}]},winRate:{$round:[{$multiply:[{$divide:["$wins","$played"]},100]},0]}}},
   {$sort:{wins:-1,winRate:-1}},{$limit:50},
   {$lookup:{from:"users",localField:"_id",foreignField:"_id",as:"u"}},{$unwind:"$u"},
   {$project:{_id:0,userId:"$_id",username:"$u.username",avatarUrl:"$u.avatarUrl",played:1,wins:1,losses:1,draws:1,winRate:1}}]);
  const titles=await this.t.aggregate([{$match:{status:"Completed",...(game?{communityId:new Types.ObjectId(game)}:{})}},{$group:{_id:"$championId",n:{$sum:1}}}]);
  const tm=new Map(titles.map((x:any)=>[String(x._id),x.n]));
  return rows.map((r:any,i:number)=>({rank:i+1,...r,titles:tm.get(String(r.userId))||0}));}
}
