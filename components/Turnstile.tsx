"use client";
import {useEffect,useRef} from "react";
declare global{interface Window{turnstile?:any}}
export const CAPTCHA_ON=!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
// Cloudflare Turnstile "I am not a robot" check. Tokens are single-use: bump resetKey after a failed submit.
export default function Turnstile({onToken,resetKey=0}:{onToken:(t:string)=>void;resetKey?:number}){
 const el=useRef<HTMLDivElement>(null);const id=useRef<string|undefined>(undefined);
 useEffect(()=>{
  const key=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;if(!key)return;
  const render=()=>{if(!el.current||!window.turnstile||id.current)return;
   id.current=window.turnstile.render(el.current,{sitekey:key,callback:onToken,"expired-callback":()=>onToken(""),"error-callback":()=>onToken("")});};
  if(window.turnstile)render();else{let s=document.getElementById("cf-ts") as HTMLScriptElement|null;
   if(!s){s=document.createElement("script");s.id="cf-ts";s.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";s.async=true;document.head.appendChild(s);}s.addEventListener("load",render);}
  return()=>{if(id.current&&window.turnstile){window.turnstile.remove(id.current);id.current=undefined;}};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{if(resetKey&&id.current&&window.turnstile){window.turnstile.reset(id.current);onToken("");}},[resetKey]);// eslint-disable-line react-hooks/exhaustive-deps
 if(!CAPTCHA_ON)return null;return <div ref={el} className="min-h-[65px]" role="group" aria-label="Security check"/>;
}
