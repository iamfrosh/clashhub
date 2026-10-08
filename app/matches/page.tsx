"use client";
import Link from "next/link";import {useCallback,useEffect,useState} from "react";import {api} from "@/lib/api";import {useAuth} from "@/components/AuthProvider";import Sheet from "@/components/Sheet";import ImageUploader from "@/components/ImageUploader";
export default function MyMatches(){
 const {user,ready}=useAuth();const [ms,setMs]=useState<any[]|null>(null);const [ts,setTs]=useState<any[]>([]);const [tab,setTab]=useState("Upcoming");const [ap,setAp]=useState<any>(null);const [st,setSt]=useState("");const [ev,setEv]=useState<string[]>([]);const [msg,setMsg]=useState("");
 const load=useCallback(()=>{api("/matches/mine").then(setMs).catch(()=>setMs([]));api("/tournaments/my/all").then(setTs).catch(()=>{})},[]);useEffect(()=>{if(user)load()},[user,load]);
 if(ready&&!user)return <p className="p-10 text-center"><Link href="/login?next=/matches" className="text-primary">Log in</Link> to see your matches.</p>;
 const groups:Record<string,any[]>={Upcoming:(ms||[]).filter(m=>["Scheduled","Awaiting referee","Pending admin"].includes(m.status)),Live:(ms||[]).filter(m=>m.status==="Live"),Past:(ms||[]).filter(m=>["Completed","Disputed","Voided"].includes(m.status))};
 const label=(m:any)=>m.teams?.length?m.teams.map((t:any)=>t.name).join(" vs "):m.participants.map((p:any)=>p.username).join(" vs ");
 const canAppeal=(m:any)=>m.status==="Completed"&&m.appealDeadline&&new Date(m.appealDeadline)>new Date();
 async function appeal(e:React.FormEvent){e.preventDefault();setMsg("");try{await api(`/matches/${ap._id}/appeal`,{method:"POST",body:JSON.stringify({statement:st,evidence:ev})});setAp(null);setSt("");setEv([]);load();}catch(x:any){setMsg(x.message)}}
 return(<div className="mx-auto max-w-3xl px-4 py-8 space-y-8"><section><h1 className="text-3xl mb-4">My Matches</h1>
  <div role="tablist" className="flex gap-1 border-b border-line mb-4">{Object.keys(groups).map(t=><button key={t} role="tab" aria-selected={tab===t} onClick={()=>setTab(t)} className={`px-4 min-h-[44px] text-sm font-medium border-b-2 ${tab===t?"border-primary text-primary":"border-transparent text-muted"}`}>{t} ({groups[t].length})</button>)}</div>
  {groups[tab].length===0?<p className="text-muted text-center py-10">Nothing here.</p>:<ul className="space-y-3">{groups[tab].map(m=><li key={m._id} className="card p-4 flex justify-between items-center gap-3"><div><p className="font-medium text-sm">{label(m)}</p>
   <p className="text-xs text-muted">{new Date(m.scheduledAt).toLocaleString()}{m.result&&` · ${m.result.scores.join(" - ")}`}</p></div>
   {m.status==="Live"?<span className="chip bg-coral text-white">LIVE</span>:canAppeal(m)?<button className="btn-ghost min-h-[40px] text-sm" onClick={()=>setAp(m)}>Appeal Result</button>:<span className="chip bg-soft border border-line">{m.status}</span>}</li>)}</ul>}</section>
  <section><h2 className="text-2xl mb-4">My Tournaments</h2>{ts.length===0?<p className="text-muted text-sm">You have not joined any tournaments.</p>:<ul className="space-y-2">{ts.map(t=><li key={t._id}><Link href={"/tournaments/"+t._id} className="card p-4 flex justify-between text-sm">{t.name}<span className="chip bg-soft border border-line">{t.status}</span></Link></li>)}</ul>}</section>
  {ap&&<Sheet title="Appeal result" onClose={()=>setAp(null)}><form onSubmit={appeal} className="space-y-3"><p className="text-sm text-muted">The referee cannot change the result while an appeal is open. The admin decides.</p>
   <textarea className="input min-h-[100px] py-3" aria-label="Statement" placeholder="What went wrong?" value={st} onChange={e=>setSt(e.target.value)} required/><div><span className="label">Evidence screenshots</span><ImageUploader value={ev} onChange={setEv} max={4} kind="evidence"/></div>
   {msg&&<p role="alert" className="text-sm text-coral">{msg}</p>}<button className="btn-primary w-full">Submit appeal</button></form></Sheet>}</div>);
}
