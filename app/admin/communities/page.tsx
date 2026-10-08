"use client";
import {useCallback,useEffect,useState} from "react";import {api} from "@/lib/api";
export default function AdminCommunities(){
 const [cs,setCs]=useState<any[]>([]);const [f,setF]=useState({name:"",slug:"",description:"",rules:""});const [err,setErr]=useState("");
 const load=useCallback(()=>{api("/communities").then(setCs).catch(()=>{})},[]);useEffect(load,[load]);const set=(k:string)=>(e:any)=>setF({...f,[k]:e.target.value});
 return(<div className="space-y-6"><h1 className="text-2xl">Communities</h1>
  <form onSubmit={async e=>{e.preventDefault();setErr("");try{await api("/communities",{method:"POST",body:JSON.stringify({...f,slug:f.slug||f.name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),isActive:true})});setF({name:"",slug:"",description:"",rules:""});load();}catch(x:any){setErr(x.message)}}} className="card p-5 grid sm:grid-cols-2 gap-3">
   <input className="input" placeholder="Game name" aria-label="Game name" value={f.name} onChange={set("name")} required/><input className="input" placeholder="Slug (optional)" aria-label="Slug" value={f.slug} onChange={set("slug")}/>
   <textarea className="input sm:col-span-2 py-3" placeholder="Description" aria-label="Description" value={f.description} onChange={set("description")}/><textarea className="input sm:col-span-2 py-3" placeholder="Rules" aria-label="Rules" value={f.rules} onChange={set("rules")}/>
   {err&&<p role="alert" className="text-coral text-sm sm:col-span-2">{err}</p>}<button className="btn-primary sm:col-span-2">Add community</button></form>
  <ul className="grid sm:grid-cols-2 gap-3">{cs.map(c=><li key={c._id} className="card p-4 flex justify-between items-center"><div><p className="font-medium">{c.name}</p><p className="text-xs text-muted">{c.memberCount} members</p></div>
   <button className="text-sm text-coral" onClick={()=>confirm("Hide this community?")&&api("/communities/"+c._id,{method:"PATCH",body:JSON.stringify({isActive:false})}).then(load)}>Hide</button></li>)}</ul></div>);
}
