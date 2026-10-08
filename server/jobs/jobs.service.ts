import {Injectable} from "@nestjs/common";import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";
import {Conversation,Match,Message,User} from "../common/schemas";import {EmailService} from "../email/email.service";
@Injectable() export class JobsService{
 constructor(@InjectModel(Match.name) private m:Model<Match>,@InjectModel(Message.name) private msgs:Model<Message>,@InjectModel(Conversation.name) private convs:Model<Conversation>,@InjectModel(User.name) private users:Model<User>,private email:EmailService){}
 async tick(){
  await this.m.updateMany({status:"Awaiting referee",refereeStatus:"pending",refereeRequestedAt:{$lt:new Date(Date.now()-864e5)}},{status:"Draft",refereeStatus:"declined",$unset:{refereeId:1}});
  await this.m.updateMany({status:"Scheduled",scheduledAt:{$lte:new Date()}},{status:"Live"});}
 // Private message unread for 5 minutes: one email per conversation and recipient, then mark emailed.
 async unread(){
  const old=await this.msgs.find({emailedAt:{$exists:false},createdAt:{$lt:new Date(Date.now()-3e5),$gt:new Date(Date.now()-864e5)},type:{$ne:"listingCard"}}).limit(200).lean();
  const seen=new Set<string>();
  for(const m of old){
   const c:any=await this.convs.findById(m.conversationId).lean();
   if(!c||c.type==="community"){await this.msgs.updateOne({_id:m._id},{emailedAt:new Date()});continue;}
   for(const p of c.participants.map(String)){const key=m.conversationId+p;
    if(p===String(m.senderId)||m.readBy.map(String).includes(p)||seen.has(key))continue;seen.add(key);
    const u:any=await this.users.findById(p);
    if(u)await this.email.send(u.email,"You have a new message",{heading:"You have a new message",body:"ClashHub Support replied in your conversation.",cta:{label:"Open messages",url:process.env.CLIENT_URL+"/messages"}});}
   await this.msgs.updateOne({_id:m._id},{emailedAt:new Date()});}}
}
