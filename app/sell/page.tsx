"use client";
import Link from "next/link";import {useEffect,useState} from "react";import {useRouter} from "next/navigation";import {api} from "@/lib/api";import {useAuth} from "@/components/AuthProvider";import ImageUploader from "@/components/ImageUploader";
export default function Sell(){
 const r=useRouter();const {user,ready}=useAuth();const [games,setGames]=useState<any[]>([]);const [f,setF]=useState({gameId:"",title:"",description:"",price:"",credentials:""});const [images,setImages]=useState<string[]>([]);const [err,setErr]=useState("");const [busy,setBusy]=useState(false);
 useEffect(()=>{api("/communities").then(setGames).catch(()=>{})},[]);const set=(k:string)=>(e:any)=>setF({...f,[k]:e.target.value});
 if(ready&&!user)return <p className="p-10 text-center">Please <Link href="/login?next=/sell" className="text-primary">log in</Link> to sell.</p>;
 if(ready&&user&&!user.verified)return <p className="p-10 text-center">Verify your email before selling. <Link href="/verify" className="text-primary">Verify now</Link></p>;
 async function submit(e:React.FormEvent){e.preventDefault();setErr("");setBusy(true);
  try{await api("/listings",{method:"POST",body:JSON.stringify({...f,price:Number(f.price),images})});r.push("/listings");}catch(x:any){setErr(x.message)}finally{setBusy(false)}}
 return(<form onSubmit={submit} className="mx-auto max-w-xl px-4 py-8 space-y-4"><h1 className="text-3xl">Sell a Game</h1>
  <div><label className="label" htmlFor="g">Game</label><select id="g" className="input" value={f.gameId} onChange={set("gameId")} required><option value="">Choose a game</option>{games.map(g=><option key={g._id} value={g._id}>{g.name}</option>)}</select></div>
  <div><label className="label" htmlFor="t">Title</label><input id="t" className="input" value={f.title} onChange={set("title")} required maxLength={120} placeholder="eFootball account, 4,200 coins"/></div>
  <div><label className="label" htmlFor="d">Description</label><textarea id="d" className="input min-h-[110px] py-3" value={f.description} onChange={set("description")}/></div>
  <div><label className="label" htmlFor="p">Price (NGN)</label><input id="p" type="number" min={1} inputMode="numeric" className="input" value={f.price} onChange={set("price")} required/></div>
  <div><span className="label">Images (up to 6)</span><ImageUploader value={images} onChange={setImages}/></div>
  <div><label className="label" htmlFor="c">Account details</label><textarea id="c" className="input min-h-[90px] py-3" value={f.credentials} onChange={set("credentials")} required/>
   <p className="text-xs text-muted mt-1">Stored encrypted. Only ClashHub admin can see this. Buyers never see it until payment is confirmed.</p></div>
  {err&&<p role="alert" className="text-sm text-coral">{err}</p>}<button className="btn-primary w-full" disabled={busy}>{busy?"Submitting...":"Submit for review"}</button></form>);
}
