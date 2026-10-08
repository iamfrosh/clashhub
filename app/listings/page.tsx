"use client";
import Loader from "@/components/Loader";
import Link from "next/link";import {useCallback,useEffect,useState} from "react";import {api} from "@/lib/api";import {naira} from "@/lib/data";import {useAuth} from "@/components/AuthProvider";import Sheet from "@/components/Sheet";
const chip:Record<string,string>={Pending:"bg-amber/10 text-amber",Approved:"bg-mint/10 text-mint",Reserved:"bg-amber/10 text-amber",Sold:"bg-mint/10 text-mint",Rejected:"bg-coral/10 text-coral"};
export default function MyListings(){
 const {user,ready}=useAuth();const [items,setItems]=useState<any[]|null>(null);const [ed,setEd]=useState<any>(null);const [err,setErr]=useState("");
 const load=useCallback(()=>{api("/listings/my/listings").then(setItems).catch(()=>setItems([]))},[]);useEffect(()=>{if(user)load()},[user,load]);
 if(ready&&!user)return <p className="p-10 text-center"><Link href="/login?next=/listings" className="text-primary">Log in</Link> to see your listings.</p>;
 async function save(e:React.FormEvent){e.preventDefault();setErr("");try{await api("/listings/"+ed.id,{method:"PATCH",body:JSON.stringify({title:ed.title,description:ed.description,price:Number(ed.price)})});setEd(null);load();}catch(x:any){setErr(x.message)}}
 return(<div className="mx-auto max-w-4xl px-4 py-8"><div className="flex justify-between items-center mb-6"><h1 className="text-3xl">My Listings</h1><Link href="/sell" className="btn-primary">Sell a Game</Link></div>
  {items===null?<Loader/>:items.length===0?<p className="text-muted text-center py-16">You have no listings yet.</p>:
  <ul className="space-y-3">{items.map(l=><li key={l.id} className="card p-4 flex gap-4">{l.images?.[0]&&<img src={l.images[0]} alt="" className="h-20 w-20 rounded-xl object-cover"/>}
   <div className="flex-1 space-y-1"><div className="flex justify-between gap-2"><h2 className="text-base">{l.title}</h2><span className={`chip h-fit ${chip[l.status]||""}`}>{l.status}</span></div>
    <p className="text-sm">{naira(l.price)} · {l.views||0} views</p>{l.rejectReason&&<p className="text-sm text-coral">Reason: {l.rejectReason}</p>}
    <div className="flex gap-4 text-sm pt-1">{!["Reserved","Sold"].includes(l.status)&&<><button className="text-primary" onClick={()=>setEd({...l})}>Edit</button>
     <button className="text-coral" onClick={async()=>{if(confirm("Delete this listing?")){await api("/listings/"+l.id,{method:"DELETE"}).catch(x=>setErr(x.message));load();}}}>Delete</button></>}
     <Link href="/messages" className="text-muted">Admin chat</Link></div></div></li>)}</ul>}
  {err&&<p role="alert" className="text-sm text-coral mt-3">{err}</p>}
  {ed&&<Sheet title="Edit listing" onClose={()=>setEd(null)}><form onSubmit={save} className="space-y-3"><input className="input" aria-label="Title" value={ed.title} onChange={e=>setEd({...ed,title:e.target.value})} required/>
   <textarea className="input min-h-[90px] py-3" aria-label="Description" value={ed.description||""} onChange={e=>setEd({...ed,description:e.target.value})}/><input type="number" className="input" aria-label="Price" value={ed.price} onChange={e=>setEd({...ed,price:e.target.value})} required/>
   <p className="text-xs text-muted">Saving sends the listing back to admin for review.</p><button className="btn-primary w-full">Save and resubmit</button></form></Sheet>}</div>);
}
