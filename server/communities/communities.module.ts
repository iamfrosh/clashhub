import {Module} from "@nestjs/common";import {MongooseModule} from "@nestjs/mongoose";import {Community,CommunitySchema,Membership,MembershipSchema} from "../common/schemas";import {CommunitiesController} from "./communities.controller";
@Module({imports:[MongooseModule.forFeature([{name:Community.name,schema:CommunitySchema},{name:Membership.name,schema:MembershipSchema}])],controllers:[CommunitiesController]})
export class CommunitiesModule{}
