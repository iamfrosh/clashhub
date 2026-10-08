import {Module} from "@nestjs/common";import {MongooseModule} from "@nestjs/mongoose";import {DealsController} from "./deals.controller";
import {Deal,DealSchema,Listing,ListingSchema,Conversation,ConversationSchema,Message,MessageSchema,AuditLog,AuditLogSchema} from "../common/schemas";
@Module({imports:[MongooseModule.forFeature([{name:Deal.name,schema:DealSchema},{name:Listing.name,schema:ListingSchema},{name:Conversation.name,schema:ConversationSchema},{name:Message.name,schema:MessageSchema},{name:AuditLog.name,schema:AuditLogSchema}])],controllers:[DealsController]})
export class DealsModule{}
