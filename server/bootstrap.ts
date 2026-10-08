import "reflect-metadata";
import {NestFactory} from "@nestjs/core";import {NestExpressApplication} from "@nestjs/platform-express";import {ValidationPipe} from "@nestjs/common";
import helmet from "helmet";import cookieParser from "cookie-parser";import {AppModule} from "./app.module";
const g=globalThis as any;
// One Nest app per warm serverless instance (cached on globalThis so dev reloads reuse it).
export function getApp():Promise<NestExpressApplication>{
 if(!g.__clashApp)g.__clashApp=(async()=>{
  const app=await NestFactory.create<NestExpressApplication>(AppModule,{logger:["error","warn"]});
  app.setGlobalPrefix("api");app.set("trust proxy",1);
  app.use(helmet({contentSecurityPolicy:false}));app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true}));
  await app.init();return app;})().catch(e=>{g.__clashApp=null;throw e;});
 return g.__clashApp;
}
