import "./env";import "reflect-metadata";
import {NestFactory} from "@nestjs/core";import {getModelToken} from "@nestjs/mongoose";import {hash} from "@node-rs/argon2";import {AppModule} from "../server/app.module";import {User,Community} from "../server/common/schemas";
(async()=>{
 const app=await NestFactory.createApplicationContext(AppModule,{logger:["error"]});
 const users:any=app.get(getModelToken(User.name)),cs:any=app.get(getModelToken(Community.name));
 await users.updateOne({email:process.env.ADMIN_EMAIL.toLowerCase()},{$setOnInsert:{username:"clashhub_admin",passwordHash:await hash(process.env.ADMIN_PASSWORD),role:"admin",emailVerified:true}},{upsert:true});
 for(const [name,slug] of [["COD Mobile","cod-mobile"],["eFootball","efootball"],["Free Fire","free-fire"]])await cs.updateOne({slug},{$setOnInsert:{name,slug,isActive:true}},{upsert:true});
 console.log("Seeded admin and communities");await app.close();process.exit(0);})();
