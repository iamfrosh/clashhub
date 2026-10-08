"use client";
import {useState} from "react";import {api} from "@/lib/api";import Sheet from "./Sheet";
type M={_id:string;name:string};
export default function CreateMatch({communityId,members,me,onClose,onDone}:{communityId:string;members:M[];me:string;onClose:()=>void;onDone:()=>void}){
 const [step,setStep]=useState(1);const [type,setType]=useState<"pvp"|"group"|"">("");const [a,setA]=useState<string[]>([]);const [b,setB]=useState<string[]>([]);
 const [names,setNames]=useState(["Team A","Team B"]);const [when,setWhen]=useState("");const [rules,setRules]=useState("");const [ref,setRef]=useState("");const [err,setErr]=useState("");const [busy,setBusy]=useState(false);
 const inMatch=[...a,...b];const nm=(id:string)=>members.find(m=>m._id===id)?.name||"Player";
 function toggle(id:string,team:"a"|"b"){const [mine,setMine,other,setOther]=team==="a"?[a,setA,b,setB]:[b,setB,a,setA] as any;
  setOther(other.filter((x:string)=>x!==id));setMine(mine.includes(id)?mine.filter((x:string)=>x!==id):type==="pvp"&&mine.length>=1?[id]:[...mine,id]);}
 const ok=[!!type,type==="pvp"?a.length===1&&b.length===1:a.length>0&&b.length>0,!!when&&!!rules.trim(),!!ref][step-1]??true;
 async function submit(){setBusy(true);setErr("");try{
  await api("/matches",{method:"POST",body:JSON.stringify({communityId,type,participants:inMatch,teams:type==="group"?[{name:names[0],members:a},{name:names[1],members:b}]:undefined,scheduledAt:new Date(when).toISOString(),rules,refereeId:ref})});onDone();}
  catch(x:any){setErr(x.message)}finally{setBusy(false)}}
 return(<Sheet title={`Create Match (${step}/5)`} onClose={onClose}><div className="space-y-4">
  {step===1&&<div className="grid gap-3">{([["pvp","Player vs Player"],["group","Group vs Group"]] as const).map(([k,l])=>
   <button key={k} onClick={()=>setType(k)} className={`card p-4 text-left ${type===k?"border-primary ring-2 ring-primary/30":""}`}>{l}</button>)}
   <p className="text-xs text-muted">Tournaments are created from the Tournaments page.</p></div>}
  {step===2&&<div className="space-y-3"><p className="text-sm text-muted">Tap a player to assign them to a side.</p>
   {type==="group"&&<div className="grid grid-cols-2 gap-2">{[0,1].map(i=><input key={i} aria-label={`Team ${i+1} name`} className="input" value={names[i]} onChange={e=>setNames(names.map((n,j)=>j===i?e.target.value:n))}/>)}</div>}
   <ul className="space-y-2 max-h-64 overflow-y-auto">{members.map(m=><li key={m._id} className="flex items-center justify-between gap-2"><span className="text-sm">{m.name}{m._id===me?" (you)":""}</span>
    <span className="flex gap-2">{(["a","b"] as const).map(t=><button key={t} onClick={()=>toggle(m._id,t)} aria-pressed={(t==="a"?a:b).includes(m._id)}
     className={`chip min-h-[44px] min-w-[44px] justify-center border ${(t==="a"?a:b).includes(m._id)?"bg-primary text-white border-primary":"border-line"}`}>{t==="a"?(type==="group"?names[0]:"Side 1"):(type==="group"?names[1]:"Side 2")}</button>)}</span></li>)}</ul></div>}
  {step===3&&<><div><label className="label" htmlFor="w">Date and time</label><input id="w" type="datetime-local" className="input" value={when} onChange={e=>setWhen(e.target.value)}/></div>
   <div><label className="label" htmlFor="r">Rules</label><textarea id="r" className="input min-h-[96px] py-3" value={rules} onChange={e=>setRules(e.target.value)}/></div></>}
  {step===4&&<div><label className="label" htmlFor="rf">Match Referee</label><select id="rf" className="input" value={ref} onChange={e=>setRef(e.target.value)}><option value="">Choose a member</option>
   {members.filter(m=>!inMatch.includes(m._id)).map(m=><option key={m._id} value={m._id}>{m.name}</option>)}</select></div>}
  {step===5&&<dl className="text-sm space-y-2"><div><dt className="text-muted">Type</dt><dd>{type==="pvp"?"Player vs Player":"Group vs Group"}</dd></div>
   <div><dt className="text-muted">Players</dt><dd>{a.map(nm).join(", ")} vs {b.map(nm).join(", ")}</dd></div><div><dt className="text-muted">When</dt><dd>{new Date(when).toLocaleString()}</dd></div>
   <div><dt className="text-muted">Referee</dt><dd>{nm(ref)}</dd></div><div><dt className="text-muted">Rules</dt><dd>{rules}</dd></div></dl>}
  {err&&<p role="alert" className="text-sm text-coral">{err}</p>}
  <div className="flex gap-3 pt-2">{step>1&&<button className="btn-ghost flex-1" onClick={()=>setStep(step-1)}>Back</button>}
   {step<5?<button className="btn-primary flex-1" disabled={!ok} onClick={()=>setStep(step+1)}>Next</button>:<button className="btn-primary flex-1" disabled={busy} onClick={submit}>Submit</button>}</div></div></Sheet>);
}
