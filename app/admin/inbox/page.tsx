"use client";
import {useCallback,useEffect,useState} from "react";import {api} from "@/lib/api";import {useAuth} from "@/components/AuthProvider";import PrivateChat from "@/components/PrivateChat";
const STATUS=["Inquiry","Payment pending","Payment received","Delivering","Completed","Cancelled","Disputed"];const FILTERS=["All","Unread","Awaiting payment","Delivering","Completed"];
export default function Inbox(){
 const {user}=useAuth();const [cs,setCs]=useState<any[]>([]);const [deals,setDeals]=useState<any[]>([]);const [cur,setCur]=useState<any>(null);const [f,setF]=useState("All");const [quick,setQuick]=useState<string[]>([]);const [pay,setPay]=useState("");const [err,setErr]=useState("");
 const load=useCallback(async()=>{const [c,d]=await Promise.all([api("/chat/admin/inbox"),api("/deals/admin/all")]);setCs(c);setDeals(d);return c;},[]);
 useEffect(()=>{load().then(c=>{const id=new URLSearchParams(location.search).get("c");if(id)setCur(c.find((x:any)=>x._id===id)||null)}).catch(()=>{});
  api("/admin/settings").then(s=>setPay(s.paymentInstructions||"")).catch(()=>{});try{setQuick(JSON.parse(localStorage.getItem("quick")||"[]"))}catch{}},[load]);
 const deal=(c:any)=>deals.find(d=>String(d._id)===String(c?.dealId));
 const shown=cs.filter(c=>{const s=deal(c)?.status;return f==="All"||(f==="Unread"&&c.unread>0)||(f==="Awaiting payment"&&(s==="Inquiry"||s==="Payment pending"))||(f==="Delivering"&&s==="Delivering")||(f==="Completed"&&s==="Completed")});
 const d=deal(cur);const saveQuick=(q:string[])=>{setQuick(q);localStorage.setItem("quick",JSON.stringify(q))};
 return(<div className="space-y-4"><h1 className="text-2xl">Inbox</h1><div className="flex gap-1 overflow-x-auto">{FILTERS.map(x=><button key={x} aria-pressed={f===x} onClick={()=>setF(x)} className={`chip min-h-[40px] px-4 border ${f===x?"bg-primary text-white border-primary":"border-line bg-white"}`}>{x}</button>)}</div>
  {err&&<p role="alert" className="text-coral text-sm">{err}</p>}
  <div className="grid lg:grid-cols-[280px_1fr_260px] gap-4"><ul className={`space-y-2 ${cur?"hidden lg:block":""}`}>{shown.map(c=>{let t="Conversation";try{t=JSON.parse(c.card.text).title}catch{}
   return <li key={c._id}><button onClick={()=>setCur(c)} className={`card w-full p-3 text-left ${cur?._id===c._id?"border-primary":""}`}><div className="flex justify-between gap-2"><p className="text-sm font-medium truncate">{t}</p>{c.unread>0&&<span className="chip bg-coral text-white">{c.unread}</span>}</div>
    <p className="text-xs text-muted">{c.type==="buyerAdmin"?"Buyer":"Seller"} · {deal(c)?.status||""}</p></button></li>})}{shown.length===0&&<li className="text-sm text-muted">No conversations.</li>}</ul>
   <div className={cur?"":"hidden lg:block"}>{cur&&user?<><button className="lg:hidden text-sm text-primary mb-2" onClick={()=>setCur(null)}>Back</button><PrivateChat key={cur._id} id={cur._id} me={user.id} other={cur.type==="buyerAdmin"?"Buyer":"Seller"}/>
    <div className="flex flex-wrap gap-2 mt-3">{[...(pay?[pay]:[]),...quick].map((q,i)=><button key={i} className="chip border border-line bg-white min-h-[36px] max-w-[220px] truncate" title={q} onClick={()=>navigator.clipboard.writeText(q)}>Copy: {q.slice(0,24)}</button>)}
     <button className="chip border border-dashed border-line min-h-[36px]" onClick={()=>{const q=prompt("Save a quick reply");if(q)saveQuick([...quick,q])}}>Add quick reply</button></div></>:<p className="text-muted text-center py-20 hidden lg:block">Select a conversation.</p>}</div>
   {cur&&d&&<aside className="card p-4 space-y-3 text-sm h-fit"><p className="font-medium">{d.listingId?.title}</p><p>Buyer: {d.buyerId?.username}</p><p>Seller: {d.sellerId?.username}</p>
    <label className="label" htmlFor="ds">Deal status</label><select id="ds" className="input" value={d.status} onChange={e=>api(`/deals/admin/${d._id}/status`,{method:"PATCH",body:JSON.stringify({status:e.target.value})}).then(load).catch(x=>setErr(x.message))}>{STATUS.map(s=><option key={s}>{s}</option>)}</select>
    <button className="btn-ghost w-full" onClick={()=>api(`/deals/admin/${d._id}/seller-chat`,{method:"POST"}).then(async c=>{const all=await load();setCur(all.find((x:any)=>x._id===c._id)||null)}).catch(x=>setErr(x.message))}>Open seller chat</button></aside>}</div></div>);
}
