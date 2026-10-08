import {Controller,Get,Req,UnauthorizedException} from "@nestjs/common";import {JobsService} from "./jobs.service";import {EmailService} from "../email/email.service";
// Called by Vercel Cron (Authorization: Bearer CRON_SECRET) or an external pinger (?key=CRON_SECRET).
@Controller("cron") export class JobsController{
 constructor(private jobs:JobsService,private email:EmailService){}
 @Get("tick") async tick(@Req() r:any){
  const key=process.env.CRON_SECRET;if(!key||(r.headers.authorization!=="Bearer "+key&&r.query?.key!==key))throw new UnauthorizedException();
  await this.jobs.tick();await this.jobs.unread();return {ok:true,emailsSent:await this.email.flush()};}
}
