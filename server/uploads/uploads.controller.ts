import {BadRequestException,Body,Controller,Post,UseGuards,Req} from "@nestjs/common";import {S3Client,PutObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";import {randomUUID} from "crypto";import {AuthGuard} from "../common/roles";
const OK=["image/jpeg","image/png","image/webp"],MAX=5*1024*1024;
@Controller("uploads") @UseGuards(AuthGuard) export class UploadsController{
 private s3=new S3Client({region:process.env.S3_REGION});
 @Post("presign") async presign(@Req() r,@Body() b:{type:string;size:number;kind:"avatar"|"listing"|"evidence"|"chat"}){
  if(!OK.includes(b.type)||b.size>MAX)throw new BadRequestException("Use JPG, PNG or WebP up to 5 MB");
  const key=b.kind+"/"+r.user.sub+"/"+randomUUID();
  const url=await getSignedUrl(this.s3,new PutObjectCommand({Bucket:process.env.S3_BUCKET,Key:key,ContentType:b.type,ContentLength:b.size}),{expiresIn:60});
  return {uploadUrl:url,publicUrl:process.env.CDN_URL+"/"+key};}
}
