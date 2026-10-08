"use client";
import {usePathname} from "next/navigation";import {useEffect,useState} from "react";import {ArrowUp,X} from "lucide-react";import {api} from "@/lib/api";import {useAuth} from "./AuthProvider";import ConsentManager from "./ConsentManager";import Loader from "./Loader";
// Global elements: splash (once per session), maintenance page, announcement banner, consent manager, scroll-to-top.
export default function SiteGate({children}:{children:React.ReactNode}){
 const {user,ready}=useAuth();const path=usePathname();const [cfg,setCfg]=useState<any>(null);const [hide,setHide]=useState(false);const [top,setTop]=useState(false);const [splash,setSplash]=useState<"show"|"fade"|"gone">("show");
 useEffect(()=>{api("/public/config").then(setCfg).catch(()=>{});const f=()=>setTop(scrollY>600);addEventListener("scroll",f,{passive:true});return()=>removeEventListener("scroll",f)},[]);
 useEffect(()=>{if(!ready)return;const t=setTimeout(()=>{setSplash("fade");try{sessionStorage.setItem("splash","1")}catch{}setTimeout(()=>setSplash("gone"),350)},650);return()=>clearTimeout(t)},[ready]);
 const overlay=splash!=="gone"&&<div id="splash" aria-hidden={splash!=="show"} className={`fixed inset-0 z-[100] grid place-items-center bg-white ${splash==="fade"?"opacity-0 transition-opacity duration-300":""}`}><Loader brand label="Loading ClashHub"/></div>;
 if(cfg?.maintenanceMode&&(!ready||user?.role!=="admin")&&path!=="/login")return <>{overlay}<div className="min-h-[60vh] grid place-items-center p-8 text-center"><div><h1 className="text-3xl mb-2">Back soon</h1><p className="text-muted">ClashHub is undergoing maintenance. Please check back shortly.</p></div></div></>;
 return(<>{overlay}{cfg?.announcement&&!hide&&<div className="bg-primary text-white text-sm px-4 py-2 flex justify-between items-center gap-3" role="status"><span><strong>{cfg.announcement.title}</strong> {cfg.announcement.body}</span><button aria-label="Dismiss" onClick={()=>setHide(true)} className="p-2"><X size={16}/></button></div>}
  {children}<ConsentManager/>
  {top&&<button aria-label="Scroll to top" onClick={()=>scrollTo({top:0,behavior:"smooth"})} className="fixed z-30 right-4 bottom-24 lg:bottom-6 h-11 w-11 rounded-full bg-white border border-line shadow-card grid place-items-center"><ArrowUp size={20}/></button>}</>);
}
