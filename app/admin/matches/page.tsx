"use client";
import {useCallback,useEffect,useState} from "react";import {api} from "@/lib/api";
export default function AdminMatches(){
 const [q,setQ]=useState<any[]>([]);const [ds,setDs]=useState<any[]>([]);const [note,setNote]=useState<Record<string,string>>({});const [sc,setSc]=useState<Record<string,string[]>>({});const [win,setWin]=useState<Record<string,string>>({});const [err,setErr]=useState("");
 const load=useCallback(()=>{api("/matches/admin/pending").then(setQ).catch(()=>{});api("/matches/admin/disputes").then(setDs).catch(()=>{})},[]);useEffect(load,[load]);
 const decide=(id:string,action:string)=>{if(!note[id]?.trim())return setErr("Add a decision note for all parties");setErr("");
  api(`/matches/admin/${id}/dispute`,{method:"PATCH",body:JSON.stringify({action,note:note[id],scores:(sc[id]||["",""]).map(Number),winnerId:win[id]||undefined})}).then(load).catch(e=>setErr(e.message));};
 return(<div className="space-y-8"><section><h1 className="text-2xl mb-3">Approval queue</h1>{q.length===0?<p className="text-sm text-muted">No matches waiting.</p>:<ul className="space-y-2">{q.map(m=><li key={m._id} className="card p-4 flex justify-between items-center gap-3 text-sm">
   <span>{m.participants.map((p:any)=>p.username).join(" vs ")} · {new Date(m.scheduledAt).toLocaleString()}</span><button className="btn-primary min-h-[40px]" onClick={()=>api(`/matches/admin/${m._id}/approve`,{method:"PATCH"}).then(load)}>Approve</button></li>)}</ul>}</section>
  <section className="space-y-3"><h2 className="text-2xl">Disputes</h2>{err&&<p role="alert" className="text-coral text-sm">{err}</p>}{ds.length===0&&<p className="text-sm text-muted">No open disputes.</p>}
   {ds.map(m=><div key={m._id} className="card p-5 space-y-3 text-sm"><p className="font-medium">{m.participants.map((p:any)=>p.username).join(" vs ")} · referee {m.refereeId?.username}</p>
    <p>Referee result: {m.result?.scores?.join(" - ")}</p><p className="text-muted">Statement: {m.appeal?.statement}</p>
    <div className="flex flex-wrap gap-3">{m.appeal?.evidence?.map((u:string,i:number)=><a key={u} href={u} target="_blank" rel="noreferrer" className="text-primary underline">Evidence {i+1}</a>)}</div>
    <textarea aria-label="Decision note" className="input py-3" placeholder="Decision note (sent to everyone involved)" value={note[m._id]||""} onChange={e=>setNote({...note,[m._id]:e.target.value})}/>
    <div className="grid grid-cols-3 gap-2"><input type="number" aria-label="Corrected score 1" placeholder="Score 1" className="input" onChange={e=>setSc({...sc,[m._id]:[e.target.value,(sc[m._id]||[])[1]||""]})}/><input type="number" aria-label="Corrected score 2" placeholder="Score 2" className="input" onChange={e=>setSc({...sc,[m._id]:[(sc[m._id]||[])[0]||"",e.target.value]})}/>
     <select aria-label="Winner" className="input" onChange={e=>setWin({...win,[m._id]:e.target.value})}><option value="">Draw</option>{m.participants.map((p:any)=><option key={p._id} value={p._id}>{p.username}</option>)}</select></div>
    <div className="flex flex-wrap gap-2"><button className="btn-primary min-h-[40px]" onClick={()=>decide(m._id,"confirm")}>Confirm result</button><button className="btn-ghost min-h-[40px]" onClick={()=>decide(m._id,"correct")}>Correct result</button><button className="btn-ghost min-h-[40px] text-coral" onClick={()=>decide(m._id,"void")}>Void match</button></div></div>)}</section></div>);
}
