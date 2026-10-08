"use client";
import Loader from "@/components/Loader";
import {useEffect,useState} from "react";import {api} from "@/lib/api";
export default function AdminSettings(){
 const [s,setS]=useState<any>(null);const [msg,setMsg]=useState("");const [an,setAn]=useState({title:"",body:""});
 useEffect(()=>{api("/admin/settings").then(setS).catch(()=>setS(false))},[]);if(s===false)return <p className="text-coral">Could not load settings.</p>;if(!s)return <Loader/>;
 const Tog=({k,l,d}:{k:string;l:string;d:string})=><label className="flex items-start justify-between gap-4 py-3"><span><span className="block font-medium text-sm">{l}</span><span className="text-xs text-muted">{d}</span></span>
  <input type="checkbox" role="switch" className="h-6 w-6 mt-1" checked={!!s[k]} onChange={e=>setS({...s,[k]:e.target.checked})}/></label>;
 return(<div className="space-y-6 max-w-2xl"><h1 className="text-2xl">Settings</h1>
  <form className="card p-5 divide-y divide-line" onSubmit={async e=>{e.preventDefault();setMsg("");try{await api("/admin/settings",{method:"PATCH",body:JSON.stringify(s)});setMsg("Saved");}catch(x:any){setMsg(x.message)}}}>
   <Tog k="autoApproveMatches" l="Automatic match approval" d="ON: accepted matches go live. OFF: they wait for you."/><Tog k="maintenanceMode" l="Maintenance mode" d="Flag for the maintenance page."/>
   <div className="py-3"><label className="label" htmlFor="w">Appeal window (hours)</label><input id="w" type="number" min={1} className="input max-w-[160px]" value={s.appealWindowHours} onChange={e=>setS({...s,appealWindowHours:Number(e.target.value)})}/></div>
   <div className="py-3"><label className="label" htmlFor="p">Payment instructions</label><textarea id="p" className="input min-h-[90px] py-3" value={s.paymentInstructions||""} onChange={e=>setS({...s,paymentInstructions:e.target.value})}/></div>
   <div className="pt-3 flex items-center gap-3"><button className="btn-primary">Save settings</button>{msg&&<span role="status" className="text-sm text-muted">{msg}</span>}</div></form>
  <form className="card p-5 space-y-3" onSubmit={async e=>{e.preventDefault();await api("/admin/announcements",{method:"POST",body:JSON.stringify(an)});setAn({title:"",body:""});setMsg("Announcement created");}}>
   <h2 className="text-base">Announcement</h2><input className="input" placeholder="Title" aria-label="Title" value={an.title} onChange={e=>setAn({...an,title:e.target.value})} required/><textarea className="input min-h-[80px] py-3" placeholder="Message" aria-label="Message" value={an.body} onChange={e=>setAn({...an,body:e.target.value})} required/><button className="btn-ghost">Create announcement</button></form></div>);
}
