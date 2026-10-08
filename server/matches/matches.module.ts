import {Module} from "@nestjs/common";import {MongooseModule} from "@nestjs/mongoose";
import {Match,MatchSchema,Membership,MembershipSchema,Setting,SettingSchema,AuditLog,AuditLogSchema,Report,ReportSchema} from "../common/schemas";import {MatchesController} from "./matches.controller";
@Module({imports:[MongooseModule.forFeature([{name:Report.name,schema:ReportSchema},{name:Match.name,schema:MatchSchema},{name:Membership.name,schema:MembershipSchema},{name:Setting.name,schema:SettingSchema},{name:AuditLog.name,schema:AuditLogSchema}])],controllers:[MatchesController]})
export class MatchesModule{}
