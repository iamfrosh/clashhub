import {createCipheriv,createDecipheriv,randomBytes} from "crypto";
const key=()=>Buffer.from(process.env.CREDS_KEY.padEnd(32,"0").slice(0,32));
export function encrypt(t:string){const iv=randomBytes(12);const c=createCipheriv("aes-256-gcm",key(),iv);
 const d=Buffer.concat([c.update(t,"utf8"),c.final()]);return [iv,c.getAuthTag(),d].map(b=>b.toString("hex")).join(":");}
export function decrypt(s:string){const [iv,tag,d]=s.split(":").map(x=>Buffer.from(x,"hex"));
 const c=createDecipheriv("aes-256-gcm",key(),iv);c.setAuthTag(tag);return Buffer.concat([c.update(d),c.final()]).toString("utf8");}
