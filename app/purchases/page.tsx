"use client";
import Loader from "@/components/Loader";
import Link from "next/link";import {useEffect,useState} from "react";import {api} from "@/lib/api";import {naira} from "@/lib/data";import {useAuth} from "@/components/AuthProvider";
export default function Purchases(){
 const {user,ready}=useAuth();const [d,setD]=useState<any[]|null>(null);useEffect(()=>{if(user)api("/deals/mine").then(setD).catch(()=>setD([]))},[user]);
 if(ready&&!user)return <p className="p-10 text-center"><Link href="/login?next=/purchases" className="text-primary">Log in</Link> to see your purchases.</p>;
 const col=(s:string)=>s==="Completed"?"bg-mint/10 text-mint":s==="Cancelled"||s==="Disputed"?"bg-coral/10 text-coral":"bg-amber/10 text-amber";
 return(<div className="mx-auto max-w-3xl px-4 py-8"><h1 className="text-3xl mb-6">My Purchases</h1>
  {d===null?<Loader/>:d.length===0?<p className="text-muted text-center py-16">No purchases yet.</p>:
  <ul className="space-y-3">{d.map(x=><li key={x._id} className="card p-4 flex justify-between gap-3"><div><p className="font-medium text-sm">{x.listingId?.title||"Listing"}</p><p className="text-sm text-muted">{naira(x.amount)} · {new Date(x.createdAt).toLocaleDateString()}</p>
   {x.status==="Completed"&&<p className="text-xs text-muted mt-1">Receipt sent to your email.</p>}</div><span className={`chip h-fit ${col(x.status)}`}>{x.status}</span></li>)}</ul>}</div>);
}
