"use client";
import {useCallback,useEffect,useState} from "react";import {api} from "@/lib/api";import {useAuth} from "@/components/AuthProvider";
export default function Referee(){
 const {user,ready}=useAuth();const [list,setList]=useState<any[]>([]);const [tab,setTab]=useState("Requests");const [open,setOpen]=useState<string|null>(null);
 const [scores,setScores]=useState(["",""]);const [win,setWin]=useState("draw");const [err,setErr]=useState("");
 const load=useCallback(()=>{api("/matches/referee/mine").then(setList).catch(()=>{})},[]);useEffect(()=>{if(user)load()},[user,load]);
 if(ready&&!user)return <p className="p-8 text-center">Log in to view your referee dashboard.</p>;
 const sets:Record<string,any[]>={Requests:list.filter(m=>m.refereeStatus==="pending"),Active:list.filter(m=>m.refereeStatus==="accepted"&&["Scheduled","Live","Awaiting result","Pending admin"].includes(m.status)),History:list.filter(m=>["Completed","Disputed","Voided"].includes(m.status))};
 const label=(m:any)=>m.teams?.length?m.teams.map((t:any)=>t.name).join(" vs "):"Player vs Player";
 async function respond(id:string,accept:boolean){await api(`/matches/${id}/referee`,{method:"POST",body:JSON.stringify({accept})}).catch(e=>setErr(e.message));load();}
 async function submit(m:any){setErr("");
  const body:any={scores:scores.map(Number)};if(win!=="draw")m.teams?.length?body.winnerTeam=Number(win):body.winnerId=m.participants[Number(win)];
  try{await api(`/matches/${m._id}/result`,{method:"POST",body:JSON.stringify(body)});setOpen(null);setScores(["",""]);setWin("draw");load();}catch(e:any){setErr(e.message)}}
 return(<div className="mx-auto max-w-3xl px-4 py-6"><h1 className="text-2xl mb-4">Referee Dashboard</h1>
  <div role="tablist" className="flex gap-1 border-b border-line mb-4">{Object.keys(sets).map(t=><button key={t} role="tab" aria-selected={tab===t} onClick={()=>setTab(t)} className={`px-4 min-h-[44px] text-sm font-medium border-b-2 ${tab===t?"border-primary text-primary":"border-transparent text-muted"}`}>{t} ({sets[t].length})</button>)}</div>
  {err&&<p role="alert" className="text-sm text-coral mb-3">{err}</p>}
  {sets[tab].length===0&&<p className="text-muted text-center py-10">Nothing here.</p>}
  <ul className="space-y-3">{sets[tab].map(m=><li key={m._id} className="card p-4 space-y-3"><div className="flex justify-between gap-3"><div><p className="font-medium text-sm">{label(m)}</p><p className="text-xs text-muted">{new Date(m.scheduledAt).toLocaleString()}</p></div><span className="chip bg-soft border border-line h-fit">{m.status}</span></div>
   {tab==="Requests"&&<div className="flex gap-2"><button className="btn-primary flex-1" onClick={()=>respond(m._id,true)}>Accept</button><button className="btn-ghost flex-1" onClick={()=>respond(m._id,false)}>Decline</button></div>}
   {tab==="Active"&&m.status!=="Pending admin"&&(open===m._id?<div className="space-y-3">
    <div className="grid grid-cols-2 gap-2">{[0,1].map(i=><input key={i} type="number" min={0} inputMode="numeric" aria-label={`Score side ${i+1}`} placeholder={m.teams?.[i]?.name||`Side ${i+1}`} className="input" value={scores[i]} onChange={e=>setScores(scores.map((s,j)=>j===i?e.target.value:s))}/>)}</div>
    <select aria-label="Winner" className="input" value={win} onChange={e=>setWin(e.target.value)}><option value="draw">Draw</option><option value="0">{m.teams?.[0]?.name||"Side 1"} wins</option><option value="1">{m.teams?.[1]?.name||"Side 2"} wins</option></select>
    <p className="text-xs text-muted">Results are final once submitted. Errors go through a correction request to admin.</p>
    <button className="btn-primary w-full" disabled={scores.some(s=>s==="")} onClick={()=>submit(m)}>Submit result</button></div>
    :<button className="btn-primary w-full" onClick={()=>setOpen(m._id)}>Enter Result</button>)}
   {tab==="History"&&m.result&&<div className="flex justify-between items-center gap-3"><p className="text-sm text-muted">Final score {m.result.scores.join(" - ")}</p>{m.status==="Completed"&&<button className="text-sm text-primary" onClick={()=>{const r=prompt("What needs correcting?");if(r)api(`/matches/${m._id}/correction`,{method:"POST",body:JSON.stringify({reason:r})}).then(()=>setErr("Correction request sent to admin.")).catch(e=>setErr(e.message))}}>Request correction</button>}</div>}</li>)}</ul></div>);
}
