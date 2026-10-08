import {Controller,Get,Param,Patch,Post,Query,Req,UseGuards} from "@nestjs/common";import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";import {Notification} from "../common/schemas";import {AuthGuard} from "../common/roles";
@Controller("notifications") @UseGuards(AuthGuard) export class NotificationsController{
 constructor(@InjectModel(Notification.name) private n:Model<Notification>){}
 @Get() async list(@Req() r,@Query("type") type?:string){
  const f:any={userId:r.user.sub};if(type)f.type=type;
  return {items:await this.n.find(f).sort({createdAt:-1}).limit(50).lean(),unread:await this.n.countDocuments({userId:r.user.sub,isRead:false})};}
 @Post("read-all") async all(@Req() r){await this.n.updateMany({userId:r.user.sub,isRead:false},{isRead:true});return {ok:true};}
 @Patch(":id/read") one(@Req() r,@Param("id") id:string){return this.n.updateOne({_id:id,userId:r.user.sub},{isRead:true});}
}
