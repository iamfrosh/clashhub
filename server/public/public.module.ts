import {Module} from "@nestjs/common";import {MongooseModule} from "@nestjs/mongoose";import {Announcement,AnnouncementSchema,Setting,SettingSchema,User,UserSchema} from "../common/schemas";import {PublicController} from "./public.controller";
@Module({imports:[MongooseModule.forFeature([{name:Announcement.name,schema:AnnouncementSchema},{name:Setting.name,schema:SettingSchema},{name:User.name,schema:UserSchema}])],controllers:[PublicController]})
export class PublicModule{}
