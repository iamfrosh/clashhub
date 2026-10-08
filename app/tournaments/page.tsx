"use client";
import Loader from "@/components/Loader";
import Link from "next/link";import {useEffect,useState} from "react";import {api} from "@/lib/api";
const TABS:[string,string][]=[["Upcoming","Registration"],["Live","Live"],["Completed","Completed"]];
export default function Tournaments(){
 const [tab,setTab]=useState("Upcoming");const [items,setItems]=useState<any[]|null>(null);
 useEffect(()=>{setItems(null);api("/tournaments?status="+TABS.find(t=>t[0]===tab)![1]).then(setItems).catch(()=>setItems([]))},[tab]);
 return(<div className="mx-auto max-w-5xl px-4 py-8"><div className="flex justify-between items-center mb-6"><h1 className="text-3xl">Tournaments</h1><Link href="/tournaments/new" className="btn-primary">Create</Link></div>
  <div role="tablist" className="flex gap-1 border-b border-line mb-6">{TABS.map(([t])=><button key={t} role="tab" aria-selected={tab===t} onClick={()=>setTab(t)} className={`px-4 min-h-[44px] text-sm font-medium border-b-2 ${tab===t?"border-primary text-primary":"border-transparent text-muted"}`}>{t}</button>)}</div>
  {items===null?<Loader/>:items.length===0?<p className="text-muted text-center py-16">No {tab.toLowerCase()} tournaments.</p>:
  <ul className="grid sm:grid-cols-2 gap-4">{items.map(t=><li key={t._id}><Link href={"/tournaments/"+t._id} className="card p-5 block hover:-translate-y-1 transition motion-reduce:transition-none space-y-2">
   <div className="flex justify-between gap-2"><h2 className="text-lg">{t.name}</h2>{t.status==="Live"&&<span className="chip bg-coral text-white">LIVE</span>}</div>
   <p className="text-sm text-muted">{t.format.replace("_"," ")} · {t.participants.length}/{t.slots} players</p>{t.startsAt&&<p className="text-sm">{new Date(t.startsAt).toLocaleString()}</p>}</Link></li>)}</ul>}</div>);
}
