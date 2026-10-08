import {BadRequestException,Body,Controller,Get,Post,UseGuards} from "@nestjs/common";import {CaptchaGuard} from "../common/captcha.guard";import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";import {Throttle} from "@nestjs/throttler";
import {Announcement,Setting,User} from "../common/schemas";import {EmailService} from "../email/email.service";
const esc=(s:string)=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
@Controller("public") export class PublicController{
 constructor(@InjectModel(Setting.name) private st:Model<Setting>,@InjectModel(Announcement.name) private an:Model<Announcement>,@InjectModel(User.name) private u:Model<User>,private email:EmailService){}
 @Get("config") async cfg(){
  const s:any=await this.st.findOne({key:"global"}).lean();const a:any=await this.an.findOne({active:true}).sort({createdAt:-1}).lean();
  return {maintenanceMode:!!s?.maintenanceMode,announcement:a?{id:a._id,title:a.title,body:a.body}:null};}
 // Contact form: emails the platform admin. Input is escaped before it reaches the template.
 @UseGuards(CaptchaGuard) @Throttle({default:{limit:3,ttl:60000}}) @Post("contact") async contact(@Body() b:{name:string;email:string;message:string;website?:string}){
  if(b.website)return {ok:true}; // honeypot: bots fill hidden fields
  if(!b.name||!/^\S+@\S+\.\S+$/.test(b.email||"")||!b.message||b.message.length>2000)throw new BadRequestException("Please complete all fields");
  const admin:any=await this.u.findOne({role:"admin"});
  if(admin)await this.email.send(admin.email,"Contact: "+esc(b.name).slice(0,60),{heading:"New contact message",body:`<strong>${esc(b.name)}</strong> (${esc(b.email)})<br><br>${esc(b.message).replace(/\n/g,"<br>")}`});
  return {ok:true};}
}
