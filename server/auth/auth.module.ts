import {Global,Module} from "@nestjs/common";import {JwtModule} from "@nestjs/jwt";import {MongooseModule} from "@nestjs/mongoose";
import {User,UserSchema} from "../common/schemas";import {AuthController} from "./auth.controller";import {AuthGuard} from "../common/roles";
@Global() @Module({imports:[JwtModule.register({global:true,secret:process.env.JWT_SECRET,signOptions:{expiresIn:"15m"}}),MongooseModule.forFeature([{name:User.name,schema:UserSchema}])],
 controllers:[AuthController],providers:[AuthGuard],exports:[AuthGuard,MongooseModule]})
export class AuthModule{}
