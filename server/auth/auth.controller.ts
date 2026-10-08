import {BadRequestException,Body,Controller,Post,Req,Res,UnauthorizedException,UseGuards} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";import {Model} from "mongoose";import {JwtService} from "@nestjs/jwt";
import {IsEmail,IsOptional,IsString,Length,Matches} from "class-validator";import {CaptchaGuard} from "../common/captcha.guard";import {hash as ah,verify as av} from "@node-rs/argon2";import {createHash,randomBytes,randomInt} from "crypto";
import {Throttle} from "@nestjs/throttler";import {EmailService} from "../email/email.service";import {User} from "../common/schemas";
class SignupDto{@Matches(/^[a-zA-Z0-9_]{3,20}$/) username:string;@IsEmail() email:string;@Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/,{message:"Password needs at least 8 characters with letters and numbers"}) password:string;@IsOptional() @IsString() captchaToken?:string;}
class VerifyDto{@IsEmail() email:string;@Length(6,6) code:string;}
class LoginDto{@IsString() identifier:string;@IsString() password:string;@IsOptional() @IsString() captchaToken?:string;}
@Controller("auth") export class AuthController{
 constructor(@InjectModel(User.name) private users:Model<User>,private jwt:JwtService,private email:EmailService){}
 @UseGuards(CaptchaGuard) @Post("signup") async signup(@Body() d:SignupDto){
  if(await this.users.exists({$or:[{email:d.email.toLowerCase()},{username:d.username.toLowerCase()}]}))throw new BadRequestException("Username or email already in use");
  const code=String(randomInt(100000,999999));
  await this.users.create({username:d.username,email:d.email,passwordHash:await ah(d.password),verifyCodeHash:await ah(code),verifyExpires:new Date(Date.now()+10*60e3)});
  await this.email.verification(d.email,code);
  return {ok:true};}
 @Throttle({default:{limit:5,ttl:60000}}) @Post("verify") async verify(@Body() d:VerifyDto){
  const u=await this.users.findOne({email:d.email.toLowerCase()});
  if(!u||u.verifyAttempts>=5||u.verifyExpires<new Date()||!(await av(u.verifyCodeHash,d.code))){
   if(u)await this.users.updateOne({_id:u._id},{$inc:{verifyAttempts:1}});throw new BadRequestException("Invalid or expired code");}
  await this.users.updateOne({_id:u._id},{emailVerified:true,$unset:{verifyCodeHash:1,verifyExpires:1}});return {ok:true};}
 @UseGuards(CaptchaGuard) @Throttle({default:{limit:10,ttl:60000}}) @Post("login") async login(@Body() d:LoginDto,@Res({passthrough:true}) res){
  const id=d.identifier.toLowerCase();const u:any=await this.users.findOne({$or:[{email:id},{username:id}]});
  if(u?.lockedUntil>new Date())throw new UnauthorizedException("Too many attempts. Try again in 15 minutes.");
  if(!u||!(await av(u.passwordHash,d.password))){
   // Account lockout: 5 wrong passwords lock the account for 15 minutes.
   if(u){const n=(u.loginFails||0)+1;await this.users.updateOne({_id:u._id},n>=5?{loginFails:0,lockedUntil:new Date(Date.now()+15*60e3)}:{loginFails:n});}
   throw new UnauthorizedException("Wrong credentials");}
  if(u.status!=="active")throw new UnauthorizedException("Account suspended");
  const first=!u.lastLoginAt;await this.users.updateOne({_id:u._id},{lastLoginAt:new Date(),loginFails:0,$unset:{lockedUntil:1}});
  const p={sub:String(u._id),role:u.role,verified:u.emailVerified};
  res.cookie("rt",await this.jwt.signAsync(p,{expiresIn:"30d"}),{httpOnly:true,secure:true,sameSite:(process.env.COOKIE_SAMESITE as any)||"lax"});
  return {accessToken:await this.jwt.signAsync(p),firstLogin:first};}

 // Resend: 60s cooldown (code sent time = verifyExpires - 10 min). Always returns ok to avoid account enumeration.
 @Throttle({default:{limit:5,ttl:60000}}) @Post("resend") async resend(@Body() d:{email:string}){
  const u=await this.users.findOne({email:(d.email||"").toLowerCase(),emailVerified:false});
  if(u&&(!u.verifyExpires||Date.now()-(+u.verifyExpires-600000)>=60000)){
   const code=String(randomInt(100000,999999));
   await this.users.updateOne({_id:u._id},{verifyCodeHash:await ah(code),verifyExpires:new Date(Date.now()+600000),verifyAttempts:0});await this.email.verification(u.email,code);}
  return {ok:true};}
 @UseGuards(CaptchaGuard) @Throttle({default:{limit:5,ttl:60000}}) @Post("forgot") async forgot(@Body() d:{email:string}){
  const u=await this.users.findOne({email:(d.email||"").toLowerCase()});
  if(u){const t=randomBytes(32).toString("hex");
   await this.users.updateOne({_id:u._id},{resetHash:createHash("sha256").update(t).digest("hex"),resetExpires:new Date(Date.now()+30*60e3)});
   await this.email.send(u.email,"Reset your ClashHub password",{heading:"Reset your password",body:"This link is valid for 30 minutes.",cta:{label:"Reset password",url:process.env.CLIENT_URL+"/reset?token="+t}});}
  return {ok:true};}
 @Throttle({default:{limit:5,ttl:60000}}) @Post("reset") async reset(@Body() d:{token:string;password:string}){
  if(!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(d.password||""))throw new BadRequestException("Password needs at least 8 characters with letters and numbers");
  const u=await this.users.findOne({resetHash:createHash("sha256").update(d.token||"").digest("hex"),resetExpires:{$gt:new Date()}});
  if(!u)throw new BadRequestException("Link is invalid or expired");
  await this.users.updateOne({_id:u._id},{passwordHash:await ah(d.password),$unset:{resetHash:1,resetExpires:1}});return {ok:true};}
 @Post("refresh") async refresh(@Req() req){
  let p:any;try{p=await this.jwt.verifyAsync(req.cookies?.rt)}catch{throw new UnauthorizedException()}
  const u=await this.users.findById(p.sub);if(!u||u.status!=="active")throw new UnauthorizedException();
  return {accessToken:await this.jwt.signAsync({sub:String(u._id),role:u.role,verified:u.emailVerified})};}
 @Post("logout") logout(@Res({passthrough:true}) res){res.clearCookie("rt");return {ok:true};}
}
