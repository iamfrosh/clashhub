"use client";
import Loader from "@/components/Loader";
import {use,useCallback,useEffect,useState} from "react";import {api} from "@/lib/api";import {useAuth} from "@/components/AuthProvider";import Bracket from "@/components/Bracket";
export default function Tournament({params}:{params:Promise<{id:string}>}){
 const {id}=use(params);const {user}=useAuth();const [t,setT]=useState<any>(null);const [err,setErr]=useState("");
 const load=useCallback(()=>{api("/tournaments/"+id).then(setT).catch(()=>setT(false))},[id]);useEffect(load,[load]);
 if(t===false)return <p className="p-10 text-center text-muted">Tournament not found.</p>;if(!t)return <div className="p-8"><Loader/></div>;
 const mine=user&&(String(t.organizerId)===user.id||user.role==="admin"),joined=user&&t.participants.map(String).includes(user.id);
 const run=(p:string,body?:any)=>api(`/tournaments/${id}/${p}`,{method:"POST",body:body?JSON.stringify(body):undefined}).then(load).catch(e=>setErr(e.message));
 return(<div className="mx-auto max-w-5xl px-4 py-8 space-y-6"><header className="card p-5 space-y-2"><div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-2xl">{t.name}</h1>
  <p className="text-sm text-muted">{t.format.replace("_"," ")} · {t.participants.length}/{t.slots} players · {t.status}</p></div>
  <div className="flex gap-2">{t.status==="Registration"&&user&&!joined&&<button className="btn-primary" onClick={()=>run("join")}>Join</button>}{joined&&t.status==="Registration"&&<span className="chip bg-mint/10 text-mint h-fit">Registered</span>}
   {t.status==="Registration"&&mine&&<button className="btn-ghost" onClick={()=>run("start")}>Close registration and draw bracket</button>}</div></div>
  {t.prize&&<p className="text-sm">Prize: {t.prize}</p>}{t.entryRules&&<p className="text-sm text-muted whitespace-pre-line">{t.entryRules}</p>}
  {t.championId&&<p className="text-sm font-medium text-mint">Champion: {t.names[t.championId]}</p>}{err&&<p role="alert" className="text-sm text-coral">{err}</p>}</header>
  {t.status==="Registration"?<section><h2 className="text-lg mb-3">Players</h2><ul className="flex flex-wrap gap-2">{t.participants.map((p:string)=><li key={p} className="chip bg-soft border border-line">{t.names[p]||"Player"}</li>)}{!t.participants.length&&<li className="text-sm text-muted">No one has joined yet.</li>}</ul></section>
  :<section><h2 className="text-lg mb-3">Bracket</h2>{mine&&t.status==="Live"&&<p className="text-xs text-muted mb-2">Tap the winner of a match to report it.</p>}<Bracket t={t} names={t.names} canReport={!!mine&&t.status==="Live"} onReport={(round,index,winnerId)=>run("result",{round,index,winnerId})}/></section>}</div>);
}
