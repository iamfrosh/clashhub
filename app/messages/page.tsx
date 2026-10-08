"use client";
import Link from "next/link";import {useEffect,useState} from "react";import {api} from "@/lib/api";import {useAuth} from "@/components/AuthProvider";import PrivateChat from "@/components/PrivateChat";
export default function Messages(){
 const {user,ready}=useAuth();const [cs,setCs]=useState<any[]|null>(null);const [cur,setCur]=useState<string|null>(null);
 useEffect(()=>{if(!user)return;api("/chat/conversations").then(x=>{setCs(x);const c=new URLSearchParams(location.search).get("c");if(c)setCur(c);else if(window.innerWidth>=768&&x[0])setCur(x[0]._id)}).catch(()=>setCs([]))},[user]);
 if(ready&&!user)return <p className="p-10 text-center"><Link href="/login?next=/messages" className="text-primary">Log in</Link> to see your messages.</p>;
 const title=(c:any)=>{try{return JSON.parse(c.card.text).title}catch{return "Conversation"}};
 return(<div className="mx-auto max-w-5xl px-4 py-6"><h1 className="text-2xl mb-4">Messages</h1>
  <div className="grid md:grid-cols-[280px_1fr] gap-4"><ul className={`space-y-2 ${cur?"hidden md:block":""}`}>{cs===null&&<li className="h-16 rounded-card bg-soft animate-pulse"/>}
   {cs?.length===0&&<li className="text-muted text-sm">No conversations yet. Tap Buy / Message Admin on a listing to start one.</li>}
   {cs?.map(c=><li key={c._id}><button onClick={()=>setCur(c._id)} className={`card w-full p-3 text-left ${cur===c._id?"border-primary":""}`}>
    <p className="text-sm font-medium truncate">{title(c)}</p><p className="text-xs text-muted">ClashHub Support · {c.kind}</p></button></li>)}</ul>
   <div className={cur?"":"hidden md:block"}>{cur&&user?<><button className="md:hidden text-sm text-primary mb-2" onClick={()=>setCur(null)}>All messages</button><PrivateChat key={cur} id={cur} me={user.id}/></>:<p className="text-muted text-center py-20 hidden md:block">Select a conversation.</p>}</div></div></div>);
}
