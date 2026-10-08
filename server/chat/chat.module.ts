import {Module} from "@nestjs/common";import {MongooseModule} from "@nestjs/mongoose";
import {Conversation,ConversationSchema,Membership,MembershipSchema,Message,MessageSchema,Report,ReportSchema} from "../common/schemas";import {ChatController} from "./chat.controller";
@Module({imports:[MongooseModule.forFeature([{name:Conversation.name,schema:ConversationSchema},{name:Message.name,schema:MessageSchema},{name:Membership.name,schema:MembershipSchema},{name:Report.name,schema:ReportSchema}])],controllers:[ChatController]})
export class ChatModule{}
