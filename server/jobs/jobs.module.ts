import {Module} from "@nestjs/common";import {MongooseModule} from "@nestjs/mongoose";
import {Conversation,ConversationSchema,Match,MatchSchema,Message,MessageSchema,User,UserSchema} from "../common/schemas";import {JobsService} from "./jobs.service";import {JobsController} from "./jobs.controller";
@Module({imports:[MongooseModule.forFeature([{name:Match.name,schema:MatchSchema},{name:Message.name,schema:MessageSchema},{name:Conversation.name,schema:ConversationSchema},{name:User.name,schema:UserSchema}])],providers:[JobsService],controllers:[JobsController]})
export class JobsModule{}
