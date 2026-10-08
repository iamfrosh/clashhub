import {Global,Module} from "@nestjs/common";import {MongooseModule} from "@nestjs/mongoose";import {Notification,NotificationSchema} from "../common/schemas";
import {NotificationsService} from "./notifications.service";import {NotificationsController} from "./notifications.controller";
@Global() @Module({imports:[MongooseModule.forFeature([{name:Notification.name,schema:NotificationSchema}])],providers:[NotificationsService],controllers:[NotificationsController],exports:[NotificationsService]})
export class NotificationsModule{}
