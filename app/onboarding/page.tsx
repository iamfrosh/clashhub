"use client";
import {useEffect,useState} from "react";import {useRouter} from "next/navigation";import {api} from "@/lib/api";import {useAuth} from "@/components/AuthProvider";import {uploadImage} from "@/components/ImageUploader";
export default function Onboarding(){
 const r=useRouter();const {user,ready}=useAuth();const [cs,setCs]=useState<any[]>([]);const [pick,setPick]=useState<string[]>([]);const [av,setAv]=useState("");const [busy,setBusy]=useState(false);const [err,setErr]=useState("");
 useEffect(()=>{api("/communities").then(setCs).catch(()=>{})},[]);
 async function finish(){setBusy(true);setErr("");try{if(av)await api("/users/me",{method:"PATCH",body:JSON.stringify({avatarUrl:av})});await Promise.all(pick.map(id=>api(`/communities/${id}/join`,{method:"POST"})));r.push("/");}catch(x:any){setErr(x.message)}finally{setBusy(false)}}
 if(ready&&!user)return null;
 return(<div className="mx-auto max-w-xl px-4 py-10 space-y-8"><h1 className="text-3xl">Welcome to ClashHub</h1>
  <section><h2 className="text-lg mb-3">Add a profile photo</h2><div className="flex items-center gap-4">{av?<img src={av} alt="Your avatar" className="h-20 w-20 rounded-full object-cover"/>:<div className="h-20 w-20 rounded-full bg-soft"/>}
   <label className="btn-ghost cursor-pointer">Choose photo<input type="file" accept="image/*" className="sr-only" onChange={async e=>{const f=e.target.files?.[0];if(f)try{setAv(await uploadImage(f,"avatar"))}catch(x:any){setErr(x.message)}}}/></label></div></section>
  <section><h2 className="text-lg mb-3">Pick your games</h2><div className="grid grid-cols-2 gap-3">{cs.map(c=>{const on=pick.includes(c._id);return <button key={c._id} aria-pressed={on} onClick={()=>setPick(on?pick.filter(x=>x!==c._id):[...pick,c._id])} className={`card p-4 text-left min-h-[44px] ${on?"border-primary ring-2 ring-primary/30":""}`}>{c.name}</button>})}</div></section>
  {err&&<p role="alert" className="text-sm text-coral">{err}</p>}<button className="btn-primary w-full" disabled={busy} onClick={finish}>{pick.length?`Join ${pick.length} communit${pick.length>1?"ies":"y"}`:"Skip for now"}</button></div>);
}
