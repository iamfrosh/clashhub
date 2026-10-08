import {CanActivate,ExecutionContext,ForbiddenException,Injectable} from "@nestjs/common";
// Cloudflare Turnstile verification. Fails closed in production if no secret is configured.
@Injectable() export class CaptchaGuard implements CanActivate{
 async canActivate(c:ExecutionContext){
  const secret=process.env.TURNSTILE_SECRET;
  if(!secret){if(process.env.NODE_ENV==="production")throw new ForbiddenException("Captcha is not configured");return true;}
  const req=c.switchToHttp().getRequest();const token=req.body?.captchaToken;
  if(!token)throw new ForbiddenException("Please complete the security check");
  const r=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({secret,response:String(token),remoteip:req.ip||""})});
  const d:any=await r.json().catch(()=>({}));if(!d.success)throw new ForbiddenException("Security check failed. Please try again.");return true;}
}
