"use client";
import Loader from "@/components/Loader";
import Link from "next/link";import {use,useEffect,useState} from "react";import {useRouter} from "next/navigation";import {BadgeCheck} from "lucide-react";
import {api} from "@/lib/api";import {naira} from "@/lib/data";import {useAuth} from "@/components/AuthProvider";
export default function ListingPage({params}:{params:Promise<{id:string}>}){
 const {id}=use(params);const r=useRouter();const {user}=useAuth();const [l,setL]=useState<any>(null);const [miss,setMiss]=useState(false);const [img,setImg]=useState(0);const [err,setErr]=useState("");const [busy,setBusy]=useState(false);
 useEffect(()=>{api("/listings/"+id).then(setL).catch(()=>setMiss(true))},[id]);
 if(miss)return <p className="p-10 text-center text-muted">This listing is no longer available. <Link href="/store" className="text-primary">Back to store</Link></p>;
 if(!l)return <div className="mx-auto max-w-5xl p-8"><Loader/></div>;
 async function buy(){if(!user)return r.push(`/login?next=/store/${id}`);setBusy(true);setErr("");
  try{const d=await api("/deals/inquire",{method:"POST",body:JSON.stringify({listingId:id})});r.push("/messages?c="+d.conversationId);}catch(x:any){setErr(x.message)}finally{setBusy(false)}}
 return(<div className="mx-auto max-w-5xl px-4 py-8 grid md:grid-cols-2 gap-8"><div>
  {l.images?.[img]?<img src={l.images[img]} alt={l.title} className="rounded-card w-full aspect-[4/3] object-cover"/>:<div className="rounded-card aspect-[4/3] bg-primary/10"/>}
  <div className="flex gap-2 mt-3 overflow-x-auto">{l.images?.map((u:string,i:number)=><button key={u} onClick={()=>setImg(i)} aria-label={`Image ${i+1}`} className={`h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 ${i===img?"border-primary":"border-transparent"}`}><img src={u} alt="" className="h-full w-full object-cover"/></button>)}</div></div>
  <div className="space-y-4"><span className="chip bg-mint/10 text-mint gap-1"><BadgeCheck size={14}/>Verified by ClashHub</span>
   <h1 className="text-3xl">{l.title}</h1><p className="text-2xl font-semibold">{naira(l.price)}</p><p className="text-muted whitespace-pre-line">{l.description}</p>
   <p className="text-xs text-muted">{l.game} · Listed {new Date(l.createdAt).toLocaleDateString()} · ID CH-{String(l.id).slice(-6).toUpperCase()}</p>
   {l.status==="Reserved"?<button disabled className="btn-ghost w-full opacity-60">Reserved</button>:<button className="btn-primary w-full" onClick={buy} disabled={busy}>Buy / Message Admin</button>}
   {err&&<p role="alert" className="text-sm text-coral">{err}</p>}
   <button className="text-sm text-muted underline" onClick={()=>user?api("/chat/report",{method:"POST",body:JSON.stringify({targetType:"listing",targetId:id,reason:"Reported from listing page"})}).then(()=>setErr("Thanks, we will review this listing.")):r.push("/login")}>Report listing</button></div></div>);
}
