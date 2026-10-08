import {BadRequestException,Body,Controller,Post,Req,ServiceUnavailableException,UseGuards} from "@nestjs/common";import {S3Client,PutObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";import {randomUUID} from "crypto";import {AuthGuard} from "../common/roles";
const OK=["image/jpeg","image/png","image/webp"],KINDS=["avatar","listing","evidence","chat"],MAX=5*1024*1024;
@Controller("uploads") @UseGuards(AuthGuard) export class UploadsController{
 private s3:S3Client|null=null;
 // Created lazily so the whole app still runs when S3 is not configured yet.
 private client(){
  if(!process.env.S3_BUCKET||!process.env.S3_REGION||!process.env.CDN_URL)throw new ServiceUnavailableException("Image uploads are not set up yet");
  return this.s3||(this.s3=new S3Client({region:process.env.S3_REGION}));}
 @Post("presign") async presign(@Req() r,@Body() b:{type:string;size:number;kind:string}){
  if(!OK.includes(b.type)||!(b.size>0&&b.size<=MAX)||!KINDS.includes(b.kind))throw new BadRequestException("Use JPG, PNG or WebP up to 5 MB");
  const s3=this.client();const key=b.kind+"/"+r.user.sub+"/"+randomUUID();
  const url=await getSignedUrl(s3,new PutObjectCommand({Bucket:process.env.S3_BUCKET,Key:key,ContentType:b.type,ContentLength:b.size}),{expiresIn:60});
  return {uploadUrl:url,publicUrl:process.env.CDN_URL+"/"+key};}
}
