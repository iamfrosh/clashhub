import {Module} from "@nestjs/common";import {MongooseModule} from "@nestjs/mongoose";
import {Deal,DealSchema,Listing,ListingSchema,Community,CommunitySchema,Match,MatchSchema,Membership,MembershipSchema,Tournament,TournamentSchema,User,UserSchema} from "../common/schemas";import {UsersController} from "./users.controller";
@Module({imports:[MongooseModule.forFeature([{name:Deal.name,schema:DealSchema},{name:Listing.name,schema:ListingSchema},{name:User.name,schema:UserSchema},{name:Community.name,schema:CommunitySchema},{name:Membership.name,schema:MembershipSchema},{name:Tournament.name,schema:TournamentSchema},{name:Match.name,schema:MatchSchema}])],controllers:[UsersController]})
export class UsersModule{}
