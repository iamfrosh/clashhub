"use client";
import Loader from "@/components/Loader";
import {useEffect,useState} from "react";import {api} from "@/lib/api";
export default function Dashboard(){
 const [d,setD]=useState<any>(null);useEffect(()=>{api("/admin/dashboard").then(setD).catch(()=>setD(false))},[]);
 if(d===false)return <p className="text-coral">Could not load dashboard.</p>;if(!d)return <Loader/>;
 const cards=[["Total users",d.users],["New today",d.newToday],["Active communities",d.communities],["Live matches",d.live],["Open disputes",d.disputes],["Pending listings",d.pending],["Sales this month",d.sales]];const max=Math.max(1,...d.signups.map((s:any)=>s.n));
 return(<div className="space-y-6"><h1 className="text-2xl">Dashboard</h1><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{cards.map(([l,v])=><div key={l as string} className="card p-4"><p className="text-xs text-muted">{l}</p><p className="text-2xl font-display font-semibold">{v}</p></div>)}</div>
  <section className="card p-5"><h2 className="text-base mb-4">Signups, last 14 days</h2>{d.signups.length?<div className="flex items-end gap-2 h-32" role="img" aria-label="Signups per day">{d.signups.map((s:any)=><div key={s._id} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-primary rounded-t" style={{height:`${(s.n/max)*100}%`}} title={`${s._id}: ${s.n}`}/><span className="text-[10px] text-muted">{s._id.slice(8)}</span></div>)}</div>:<p className="text-sm text-muted">No signups yet.</p>}</section></div>);
}
