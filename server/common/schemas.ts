import {Prop,Schema,SchemaFactory} from "@nestjs/mongoose";import {Types} from "mongoose";
export type Role="member"|"admin";
@Schema({timestamps:true}) export class User{
 @Prop({required:true,unique:true,lowercase:true,index:true}) username:string;
 @Prop({required:true,unique:true,lowercase:true,index:true}) email:string;
 @Prop({required:true}) passwordHash:string;
 @Prop({default:false}) emailVerified:boolean;
 @Prop({type:String,default:"member"}) role:Role;
 @Prop({type:String,default:"active"}) status:"active"|"suspended"|"banned";
 @Prop() avatarUrl:string;@Prop() bio:string;
 @Prop({type:Object,default:{}}) stats:Record<string,{wins:number;losses:number;draws:number}>;
 @Prop({type:[Types.ObjectId],ref:"User"}) blocked:Types.ObjectId[];@Prop({default:0}) loginFails:number;@Prop() lockedUntil:Date;@Prop() resetHash:string;@Prop() resetExpires:Date;@Prop() lastLoginAt:Date;@Prop({default:false}) marketingOptOut:boolean;@Prop() verifyCodeHash:string;@Prop() verifyExpires:Date;@Prop({default:0}) verifyAttempts:number;}
export const UserSchema=SchemaFactory.createForClass(User);
@Schema({timestamps:true}) export class Community{
 @Prop({required:true}) name:string;@Prop({unique:true}) slug:string;@Prop() icon:string;@Prop() banner:string;
 @Prop() description:string;@Prop() rules:string;@Prop({default:true}) isActive:boolean;
 @Prop({type:[Types.ObjectId]}) moderators:Types.ObjectId[];@Prop({default:0}) memberCount:number;}
export const CommunitySchema=SchemaFactory.createForClass(Community);
@Schema({timestamps:true}) export class Listing{
 @Prop({type:Types.ObjectId,ref:"Community",index:true}) gameId:Types.ObjectId;
 @Prop({type:Types.ObjectId,ref:"User",select:false}) sellerId:Types.ObjectId;
 @Prop({required:true}) title:string;@Prop() description:string;@Prop({required:true}) price:number;
 @Prop({type:[String],validate:(v:string[])=>v.length<=6}) images:string[];
 @Prop({select:false}) encryptedCredentials:string;
 @Prop({type:String,default:"Pending",index:true}) status:"Draft"|"Pending"|"Approved"|"Rejected"|"Reserved"|"Sold"|"Removed";
 @Prop() rejectReason:string;@Prop({default:false}) featured:boolean;@Prop({default:0}) views:number;}
export const ListingSchema=SchemaFactory.createForClass(Listing);
@Schema({timestamps:true}) export class Deal{
 @Prop({type:Types.ObjectId,ref:"Listing"}) listingId:Types.ObjectId;@Prop({type:Types.ObjectId,ref:"User"}) buyerId:Types.ObjectId;
 @Prop({type:Types.ObjectId,ref:"User"}) sellerId:Types.ObjectId;@Prop() amount:number;@Prop({default:0}) fee:number;
 @Prop({type:String,default:"Inquiry"}) status:"Inquiry"|"Payment pending"|"Payment received"|"Delivering"|"Completed"|"Cancelled"|"Disputed";
 @Prop({type:[Object],default:[]}) history:any[];}
export const DealSchema=SchemaFactory.createForClass(Deal);
@Schema({timestamps:true}) export class Conversation{
 @Prop({type:String}) type:"community"|"buyerAdmin"|"sellerAdmin";@Prop({type:[Types.ObjectId]}) participants:Types.ObjectId[];
 @Prop({type:Types.ObjectId}) listingId:Types.ObjectId;@Prop({type:Types.ObjectId}) dealId:Types.ObjectId;@Prop({type:Types.ObjectId,index:true}) communityId:Types.ObjectId;@Prop() lastMessageAt:Date;}
export const ConversationSchema=SchemaFactory.createForClass(Conversation);
@Schema({timestamps:true}) export class Message{
 @Prop({type:Types.ObjectId,index:true}) conversationId:Types.ObjectId;@Prop({type:Types.ObjectId}) senderId:Types.ObjectId;
 @Prop({default:"text"}) type:string;@Prop() text:string;@Prop({type:Types.ObjectId}) replyTo:Types.ObjectId;@Prop({default:false}) pinned:boolean;@Prop({default:false}) deleted:boolean;@Prop() emailedAt:Date;@Prop({type:[String]}) attachments:string[];@Prop({type:[Types.ObjectId]}) readBy:Types.ObjectId[];}
export const MessageSchema=SchemaFactory.createForClass(Message);
@Schema({timestamps:true}) export class AuditLog{
 @Prop({type:Types.ObjectId}) actorId:Types.ObjectId;@Prop() action:string;@Prop() target:string;@Prop({type:Object}) before:any;@Prop({type:Object}) after:any;}
export const AuditLogSchema=SchemaFactory.createForClass(AuditLog);
@Schema({timestamps:true}) export class Membership{
 @Prop({type:Types.ObjectId,ref:"User",index:true}) userId:Types.ObjectId;@Prop({type:Types.ObjectId,index:true}) communityId:Types.ObjectId;@Prop({type:String,default:"member"}) role:"member"|"moderator";@Prop() mutedUntil:Date;}
export const MembershipSchema=SchemaFactory.createForClass(Membership);
MembershipSchema.index({userId:1,communityId:1},{unique:true});
@Schema({timestamps:true}) export class Match{
 @Prop({type:Types.ObjectId,index:true}) communityId:Types.ObjectId;@Prop({type:Types.ObjectId}) creatorId:Types.ObjectId;
 @Prop({type:String}) type:"pvp"|"group"|"tournament";@Prop({type:[Object]}) teams:{name:string;members:string[]}[];
 @Prop({type:[Types.ObjectId]}) participants:Types.ObjectId[];@Prop({type:Types.ObjectId}) refereeId:Types.ObjectId;
 @Prop({type:String,default:"pending"}) refereeStatus:"pending"|"accepted"|"declined";@Prop() refereeRequestedAt:Date;
 @Prop() scheduledAt:Date;@Prop() rules:string;
 @Prop({type:String,default:"Awaiting referee",index:true}) status:"Draft"|"Awaiting referee"|"Pending admin"|"Scheduled"|"Live"|"Awaiting result"|"Completed"|"Disputed"|"Voided";
 @Prop({type:Object}) result:{scores:number[];outcome:"win"|"draw";winnerIds?:string[];submittedAt:Date};
 @Prop() appealDeadline:Date;@Prop({type:Object}) appeal:{by:string;statement:string;evidence:string[]};@Prop() adminDecision:string;}
export const MatchSchema=SchemaFactory.createForClass(Match);
@Schema() export class Setting{
 @Prop({unique:true,default:"global"}) key:string;@Prop({default:true}) autoApproveMatches:boolean;@Prop({default:24}) appealWindowHours:number;
 @Prop({default:false}) maintenanceMode:boolean;@Prop() paymentInstructions:string;}
export const SettingSchema=SchemaFactory.createForClass(Setting);
@Schema({timestamps:true}) export class Tournament{
 @Prop({type:Types.ObjectId,index:true}) communityId:Types.ObjectId;@Prop({type:Types.ObjectId}) organizerId:Types.ObjectId;
 @Prop({required:true}) name:string;@Prop({type:String,default:"single_elimination"}) format:"single_elimination"|"round_robin";
 @Prop() slots:number;@Prop() entryRules:string;@Prop() prize:string;@Prop() startsAt:Date;
 @Prop({type:[Types.ObjectId]}) participants:Types.ObjectId[];@Prop({type:[Types.ObjectId]}) refereeIds:Types.ObjectId[];
 @Prop({type:[Object],default:[]}) bracket:{matches:{a?:string;b?:string;winner?:string}[]}[];
 @Prop({type:String,default:"Registration",index:true}) status:"Registration"|"Live"|"Completed";@Prop({type:Types.ObjectId}) championId:Types.ObjectId;}
export const TournamentSchema=SchemaFactory.createForClass(Tournament);
@Schema({timestamps:true}) export class Announcement{
 @Prop() title:string;@Prop() body:string;@Prop({default:true}) active:boolean;}
export const AnnouncementSchema=SchemaFactory.createForClass(Announcement);
@Schema({timestamps:true}) export class Report{
 @Prop({type:String}) targetType:"message"|"listing"|"user"|"match";@Prop({type:Types.ObjectId}) targetId:Types.ObjectId;@Prop({type:Types.ObjectId}) reporterId:Types.ObjectId;
 @Prop() reason:string;@Prop({type:String,default:"open"}) status:"open"|"resolved";@Prop() resolution:string;}
export const ReportSchema=SchemaFactory.createForClass(Report);
@Schema({timestamps:true}) export class EmailBatch{
 @Prop({type:Types.ObjectId}) sentBy:Types.ObjectId;@Prop() subject:string;@Prop({type:Object}) audience:any;
 @Prop({default:0}) recipientCount:number;@Prop({default:0}) sent:number;@Prop({default:0}) failed:number;@Prop() scheduledAt:Date;}
export const EmailBatchSchema=SchemaFactory.createForClass(EmailBatch);
@Schema({timestamps:true}) export class Notification{
 @Prop({type:Types.ObjectId,index:true}) userId:Types.ObjectId;@Prop() type:string;@Prop({type:Object}) data:any;@Prop({default:false}) isRead:boolean;}
export const NotificationSchema=SchemaFactory.createForClass(Notification);
@Schema({timestamps:true}) export class EmailJob{
 @Prop() to:string;@Prop() subject:string;@Prop() html:string;@Prop({type:Types.ObjectId,index:true}) batchId:Types.ObjectId;
 @Prop({default:()=>new Date(),index:true}) runAt:Date;@Prop({type:String,default:"pending",index:true}) status:"pending"|"sent"|"failed";@Prop({default:0}) attempts:number;}
export const EmailJobSchema=SchemaFactory.createForClass(EmailJob);
