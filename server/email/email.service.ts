import {Injectable} from "@nestjs/common";import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";import {Resend} from "resend";
import {EmailBatch,EmailJob} from "../common/schemas";import {layout} from "./template";
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
@Injectable() export class EmailService{
 private r=process.env.RESEND_API_KEY?new Resend(process.env.RESEND_API_KEY):null;
 constructor(@InjectModel(EmailJob.name) private jobs:Model<EmailJob>,@InjectModel(EmailBatch.name) private batches:Model<EmailBatch>){}
 private from(){return process.env.MAIL_FROM||"ClashHub <onboarding@resend.dev>";}
 // Transactional mail goes out immediately. If the provider fails, a retry job is kept for the cron tick.
 async send(to:string,subject:string,o:Parameters<typeof layout>[0]){
  const html=layout(o);if(!this.r){console.log("[email:dev]",to,subject);return;}
  try{const {error}=await this.r.emails.send({from:this.from(),to,subject,html});if(error)throw new Error(error.message);}
  catch{await this.jobs.create({to,subject,html,status:"pending",attempts:1,runAt:new Date(Date.now()+60000)});}}
 verification(to:string,code:string){return this.send(to,"Verify your ClashHub email",{heading:"Your verification code",body:"Enter this code within 10 minutes: <strong style=\"font-size:24px;letter-spacing:4px\">"+code+"</strong>"});}
 receipt(to:string,title:string,amount:number){return this.send(to,"Your ClashHub receipt",{heading:"Deal completed",body:title+" - NGN "+amount.toLocaleString("en-NG"),cta:{label:"View purchase",url:process.env.CLIENT_URL+"/purchases"}});}
 listingStatus(to:string,title:string,status:string,reason?:string){return this.send(to,"Listing "+status.toLowerCase(),{heading:"Your listing was "+status.toLowerCase(),body:title+(reason?". Reason: "+reason:""),cta:{label:"My listings",url:process.env.CLIENT_URL+"/listings"}});}
 // Bulk: stored as jobs, sent in provider batches of 100. Anything left over is finished by the cron tick.
 async bulk(batchId:string,recipients:string[],subject:string,o:Parameters<typeof layout>[0],startAt=Date.now()){
  const html=layout({...o,marketing:true});
  await this.jobs.insertMany(recipients.map(to=>({to,subject,html,batchId,runAt:new Date(startAt),status:"pending"})));
  if(startAt<=Date.now()){const t0=Date.now();while(Date.now()-t0<20000){const n=await this.flush();if(n<100)break;await sleep(600);}}}
 private async tally(rows:any[],field:"sent"|"failed"){const m=new Map<string,number>();
  for(const d of rows)if(d.batchId)m.set(String(d.batchId),(m.get(String(d.batchId))||0)+1);
  await Promise.all([...m].map(([id,n])=>this.batches.updateOne({_id:id},{$inc:{[field]:n}})));}
 async flush(limit=100):Promise<number>{
  const due:any[]=await this.jobs.find({status:"pending",runAt:{$lte:new Date()},attempts:{$lt:5}}).sort({runAt:1}).limit(limit).lean();
  if(!due.length)return 0;const ids=due.map(d=>d._id);
  if(!this.r){await this.jobs.updateMany({_id:{$in:ids}},{status:"sent"});await this.tally(due,"sent");return due.length;}
  try{const {error}=await this.r.batch.send(due.map(d=>({from:this.from(),to:d.to,subject:d.subject,html:d.html})));if(error)throw new Error(error.message);
   await this.jobs.updateMany({_id:{$in:ids}},{status:"sent"});await this.tally(due,"sent");}
  catch{await this.jobs.updateMany({_id:{$in:ids}},{$inc:{attempts:1},runAt:new Date(Date.now()+120000)});
   const dead:any[]=await this.jobs.find({_id:{$in:ids},attempts:{$gte:5}}).lean();
   if(dead.length){await this.jobs.updateMany({_id:{$in:dead.map(d=>d._id)}},{status:"failed"});await this.tally(dead,"failed");}}
  return due.length;}
}
