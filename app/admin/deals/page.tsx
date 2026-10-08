"use client";
import Link from "next/link";import {useCallback,useEffect,useState} from "react";import {api} from "@/lib/api";import {naira} from "@/lib/data";
const DEAL_STATUS=["Inquiry","Payment pending","Payment received","Delivering","Completed","Cancelled","Disputed"];
export default function Deals(){
 const [d,setD]=useState<any[]|null>(null);const [err,setErr]=useState("");const load=useCallback(()=>{api("/deals/admin/all").then(setD).catch(()=>setD([]))},[]);useEffect(load,[load]);
 return(<div className="space-y-4"><h1 className="text-2xl">Deals</h1>{err&&<p role="alert" className="text-coral text-sm">{err}</p>}
  <div className="card overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-muted"><tr>{["Listing","Buyer","Seller","Amount","Fee","Status","Chat"].map(h=><th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
   <tbody>{(d||[]).map(x=><tr key={x._id} className="border-t border-line"><td className="p-3">{x.listingId?.title}</td><td className="p-3">{x.buyerId?.username}</td><td className="p-3">{x.sellerId?.username}</td><td className="p-3">{naira(x.amount)}</td>
    <td className="p-3"><input type="number" min={0} aria-label="Commission fee" defaultValue={x.fee||0} className="input min-h-[40px] w-24 py-1" onBlur={e=>api(`/deals/admin/${x._id}/fee`,{method:"PATCH",body:JSON.stringify({fee:Number(e.target.value)})}).catch(y=>setErr(y.message))}/></td>
    <td className="p-3"><select aria-label="Deal status" className="input min-h-[40px] py-1" value={x.status} onChange={e=>api(`/deals/admin/${x._id}/status`,{method:"PATCH",body:JSON.stringify({status:e.target.value})}).then(load).catch(y=>setErr(y.message))}>{DEAL_STATUS.map(s=><option key={s}>{s}</option>)}</select></td>
    <td className="p-3">{x.chatId&&<Link className="text-primary" href={"/admin/inbox?c="+x.chatId}>Open</Link>}</td></tr>)}</tbody></table>{d&&!d.length&&<p className="p-6 text-center text-muted">No deals yet.</p>}</div></div>);
}
