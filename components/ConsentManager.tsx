"use client";
import Link from "next/link";import {useEffect,useState} from "react";import Sheet from "./Sheet";
const KEY="consent_v1";type C={analytics:boolean;ts:number};
// Consent: nothing optional loads until the visitor opts in. Accept and Reject have equal prominence.
export default function ConsentManager(){
 const [c,setC]=useState<C|null|undefined>(undefined);const [open,setOpen]=useState(false);const [an,setAn]=useState(false);
 useEffect(()=>{try{const v=localStorage.getItem(KEY);const p=v?JSON.parse(v):null;setC(p);if(p)setAn(p.analytics)}catch{setC(null)}
  const h=()=>setOpen(true);addEventListener("open-cookie-settings",h);return()=>removeEventListener("open-cookie-settings",h)},[]);
 const save=(analytics:boolean)=>{const was=c?.analytics;try{localStorage.setItem(KEY,JSON.stringify({analytics,ts:Date.now()}))}catch{}setC({analytics,ts:Date.now()});setAn(analytics);setOpen(false);if(was&&!analytics)location.reload();};
 useEffect(()=>{const id=process.env.NEXT_PUBLIC_GA_ID;if(!c?.analytics||!id||document.getElementById("ga"))return;
  const s=document.createElement("script");s.id="ga";s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+id;document.head.appendChild(s);
  const w=window as any;w.dataLayer=w.dataLayer||[];w.gtag=function(){w.dataLayer.push(arguments)};w.gtag("js",new Date());w.gtag("config",id,{anonymize_ip:true});},[c]);
 return(<>{c===null&&!open&&<div role="dialog" aria-label="Cookie consent" className="fixed z-40 bottom-20 lg:bottom-4 inset-x-4 lg:left-4 lg:right-auto lg:max-w-md card p-5 space-y-3 text-sm">
  <p className="font-medium">Cookies on ClashHub</p><p className="text-muted">We use essential cookies to keep you signed in and secure. With your permission we also use analytics to improve the site. <Link href="/cookies" className="text-primary">Cookie Policy</Link></p>
  <div className="grid grid-cols-2 gap-2"><button className="btn-ghost" onClick={()=>save(false)}>Reject non-essential</button><button className="btn-primary" onClick={()=>save(true)}>Accept all</button></div>
  <button className="text-primary underline min-h-[44px]" onClick={()=>setOpen(true)}>Customise</button></div>}
  {open&&<Sheet title="Cookie settings" onClose={()=>setOpen(false)}><div className="space-y-4 text-sm">
   <div className="flex justify-between gap-4"><div><p className="font-medium">Essential</p><p className="text-muted">Sign-in, security and your preferences. Always on.</p></div><input type="checkbox" checked disabled aria-label="Essential cookies always on" className="h-6 w-6 mt-1"/></div>
   <div className="flex justify-between gap-4"><div><p className="font-medium">Analytics</p><p className="text-muted">Anonymous usage statistics.</p></div><input type="checkbox" role="switch" checked={an} onChange={e=>setAn(e.target.checked)} aria-label="Analytics cookies" className="h-6 w-6 mt-1"/></div>
   <button className="btn-primary w-full" onClick={()=>save(an)}>Save choices</button></div></Sheet>}</>);
}
