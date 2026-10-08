"use client";
import Loader from "@/components/Loader";
import Link from "next/link";import {useCallback,useEffect,useState} from "react";import {api} from "@/lib/api";import {useAuth} from "@/components/AuthProvider";
const text=(n:any):[string,string]=>n.type==="referee_request"?["You were picked as a referee","/referee"]:n.type==="listing_status"?[`Your listing was ${String(n.data?.status).toLowerCase()}`,"/listings"]:["New activity","/"];
export default function Notifications(){
 const {user,ready}=useAuth();const [d,setD]=useState<{items:any[];unread:number}|null>(null);
 const load=useCallback(()=>{api("/notifications").then(setD).catch(()=>setD({items:[],unread:0}))},[]);
 useEffect(()=>{if(!user)return;load();const t=setInterval(()=>{if(!document.hidden)load()},15000);return()=>clearInterval(t)},[user,load]);
 if(ready&&!user)return <p className="p-10 text-center"><Link href="/login?next=/notifications" className="text-primary">Log in</Link> to see notifications.</p>;
 return(<div className="mx-auto max-w-2xl px-4 py-8"><div className="flex justify-between items-center mb-6"><h1 className="text-3xl">Notifications</h1>{!!d?.unread&&<button className="text-sm text-primary" onClick={()=>api("/notifications/read-all",{method:"POST"}).then(load)}>Mark all read</button>}</div>
  {!d?<Loader/>:d.items.length===0?<p className="text-muted text-center py-16">You are all caught up.</p>:
  <ul className="space-y-2">{d.items.map(n=>{const [t,h]=text(n);return <li key={n._id}><Link href={h} onClick={()=>api(`/notifications/${n._id}/read`,{method:"PATCH"})} className={`card p-4 flex justify-between gap-3 text-sm ${n.isRead?"":"border-primary"}`}>{t}<span className="text-xs text-muted">{new Date(n.createdAt).toLocaleDateString()}</span></Link></li>})}</ul>}</div>);
}
