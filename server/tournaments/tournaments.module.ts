import {Module} from "@nestjs/common";import {MongooseModule} from "@nestjs/mongoose";import {User,UserSchema,Tournament,TournamentSchema,Membership,MembershipSchema} from "../common/schemas";import {TournamentsController} from "./tournaments.controller";
@Module({imports:[MongooseModule.forFeature([{name:User.name,schema:UserSchema},{name:Tournament.name,schema:TournamentSchema},{name:Membership.name,schema:MembershipSchema}])],controllers:[TournamentsController]})
export class TournamentsModule{}
