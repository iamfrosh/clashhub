"use client";
import Link from "next/link";import {useEffect,useState} from "react";import {useRouter} from "next/navigation";import {api} from "@/lib/api";import {useAuth} from "@/components/AuthProvider";
export default function NewTournament(){
 const r=useRouter();const {user,ready}=useAuth();const [cs,setCs]=useState<any[]>([]);const [f,setF]=useState({communityId:"",name:"",format:"single_elimination",slots:"8",startsAt:"",entryRules:"",prize:""});const [err,setErr]=useState("");
 useEffect(()=>{api("/communities").then(setCs).catch(()=>{})},[]);const set=(k:string)=>(e:any)=>setF({...f,[k]:e.target.value});
 if(ready&&!user)return <p className="p-10 text-center"><Link href="/login?next=/tournaments/new" className="text-primary">Log in</Link> to create a tournament.</p>;
 return(<form onSubmit={async e=>{e.preventDefault();setErr("");try{const t=await api("/tournaments",{method:"POST",body:JSON.stringify({...f,slots:Number(f.slots),startsAt:f.startsAt?new Date(f.startsAt).toISOString():undefined})});r.push("/tournaments/"+t._id);}catch(x:any){setErr(x.message)}}} className="mx-auto max-w-xl px-4 py-8 space-y-4">
  <h1 className="text-3xl">Create Tournament</h1>
  <div><label className="label" htmlFor="c">Community</label><select id="c" className="input" value={f.communityId} onChange={set("communityId")} required><option value="">Choose (you must be a member)</option>{cs.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
  <div><label className="label" htmlFor="n">Name</label><input id="n" className="input" value={f.name} onChange={set("name")} required/></div>
  <div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="f">Format</label><select id="f" className="input" value={f.format} onChange={set("format")}><option value="single_elimination">Single elimination</option><option value="round_robin">Round robin</option></select></div>
   <div><label className="label" htmlFor="s">Slots</label><input id="s" type="number" min={2} max={128} className="input" value={f.slots} onChange={set("slots")} required/></div></div>
  <div><label className="label" htmlFor="d">Start</label><input id="d" type="datetime-local" className="input" value={f.startsAt} onChange={set("startsAt")}/></div>
  <div><label className="label" htmlFor="r">Entry rules</label><textarea id="r" className="input min-h-[80px] py-3" value={f.entryRules} onChange={set("entryRules")}/></div>
  <div><label className="label" htmlFor="p">Prize (text only)</label><input id="p" className="input" value={f.prize} onChange={set("prize")}/></div>
  {err&&<p role="alert" className="text-sm text-coral">{err}</p>}<button className="btn-primary w-full">Create tournament</button></form>);
}
