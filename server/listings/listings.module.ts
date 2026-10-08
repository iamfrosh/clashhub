import {Module} from "@nestjs/common";import {MongooseModule} from "@nestjs/mongoose";
import {User,UserSchema,Listing,ListingSchema,AuditLog,AuditLogSchema} from "../common/schemas";import {ListingsController} from "./listings.controller";
@Module({imports:[MongooseModule.forFeature([{name:User.name,schema:UserSchema},{name:Listing.name,schema:ListingSchema},{name:AuditLog.name,schema:AuditLogSchema}])],controllers:[ListingsController]})
export class ListingsModule{}
