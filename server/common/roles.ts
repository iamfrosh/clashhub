import {CanActivate,ExecutionContext,Injectable,SetMetadata} from "@nestjs/common";import {Reflector} from "@nestjs/core";import {JwtService} from "@nestjs/jwt";
export const Roles=(...r:string[])=>SetMetadata("roles",r);
@Injectable() export class AuthGuard implements CanActivate{
 constructor(private jwt:JwtService,private ref:Reflector){}
 canActivate(c:ExecutionContext){
  const req=c.switchToHttp().getRequest();const t=req.headers.authorization?.replace("Bearer ","");
  try{req.user=this.jwt.verify(t)}catch{return false}
  const roles=this.ref.get<string[]>("roles",c.getHandler());
  return !roles||roles.includes(req.user.role);}
}
