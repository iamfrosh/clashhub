import {Injectable} from "@nestjs/common";import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";import {Notification} from "../common/schemas";
@Injectable() export class NotificationsService{
 constructor(@InjectModel(Notification.name) private n:Model<Notification>){}
 create(userId:any,type:string,data:any){return this.n.create({userId,type,data});}
}
