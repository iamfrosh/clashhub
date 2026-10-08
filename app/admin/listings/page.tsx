"use client";
import Loader from "@/components/Loader";
import {useCallback,useEffect,useState} from "react";import {api} from "@/lib/api";import {naira} from "@/lib/data";
const ST=["Pending","Approved","Reserved","Sold","Rejected","Removed"];
export default function AdminListings(){
 const [st,setSt]=useState("Pending");const [l,setL]=useState<any[]|null>(null);const [creds,setCreds]=useState<Record<string,string>>({});const [err,setErr]=useState("");
 const load=useCallback(()=>{setL(null);api("/listings/admin/all?status="+st).then(setL).catch(()=>setL([]))},[st]);useEffect(load,[load]);
 const setStatus=(id:string,status:string,reason?:string)=>api(`/listings/admin/${id}/status`,{method:"PATCH",body:JSON.stringify({status,reason})}).then(load).catch(e=>setErr(e.message));
 return(<div className="space-y-4"><h1 className="text-2xl">Listings</h1>
  <div className="flex gap-1 overflow-x-auto">{ST.map(s=><button key={s} aria-pressed={st===s} onClick={()=>setSt(s)} className={`chip min-h-[40px] px-4 border ${st===s?"bg-primary text-white border-primary":"border-line bg-white"}`}>{s}</button>)}</div>{err&&<p role="alert" className="text-coral text-sm">{err}</p>}
  {l===null?<Loader/>:l.length===0?<p className="text-muted py-10 text-center">Nothing here.</p>:
  <ul className="space-y-3">{l.map(x=><li key={x._id} className="card p-4 space-y-3"><div className="flex gap-3">{x.images?.[0]&&<img src={x.images[0]} alt="" className="h-20 w-20 rounded-xl object-cover"/>}
   <div className="flex-1"><p className="font-medium">{x.title}</p><p className="text-sm text-muted">{x.gameId?.name} · {naira(x.price)}</p><p className="text-sm">Seller: <strong>{x.sellerId?.username}</strong> ({x.sellerId?.email})</p>{x.featured&&<span className="chip bg-primary/10 text-primary">Featured</span>}</div></div>
   <p className="text-sm text-muted whitespace-pre-line">{x.description}</p>
   {creds[x._id]?<pre className="bg-soft rounded-xl p-3 text-sm whitespace-pre-wrap break-all">{creds[x._id]}</pre>:<button className="text-sm text-primary" onClick={()=>api(`/listings/admin/${x._id}/credentials`).then(r=>setCreds({...creds,[x._id]:r.credentials})).catch(e=>setErr(e.message))}>Reveal account details (logged)</button>}
   <div className="flex flex-wrap gap-2">{x.status==="Pending"&&<><button className="btn-primary min-h-[40px]" onClick={()=>setStatus(x._id,"Approved")}>Approve</button>
    <button className="btn-ghost min-h-[40px]" onClick={()=>{const r=prompt("Reason for rejection");if(r)setStatus(x._id,"Rejected",r)}}>Reject</button></>}
    <button className="btn-ghost min-h-[40px]" onClick={()=>api(`/listings/admin/${x._id}/feature`,{method:"PATCH",body:JSON.stringify({featured:!x.featured})}).then(load)}>{x.featured?"Unfeature":"Feature"}</button>
    <select aria-label="Change status" className="input min-h-[40px] py-1 w-auto" value="" onChange={e=>e.target.value&&setStatus(x._id,e.target.value)}><option value="">Set status</option>{["Approved","Reserved","Sold","Removed"].map(s=><option key={s}>{s}</option>)}</select></div></li>)}</ul>}</div>);
}
