import {Module} from "@nestjs/common";import {MongooseModule} from "@nestjs/mongoose";import {Match,MatchSchema,Tournament,TournamentSchema} from "../common/schemas";import {LeaderboardsController} from "./leaderboards.controller";
@Module({imports:[MongooseModule.forFeature([{name:Match.name,schema:MatchSchema},{name:Tournament.name,schema:TournamentSchema}])],controllers:[LeaderboardsController]})
export class LeaderboardsModule{}
