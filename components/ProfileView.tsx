"use client";
import Loader from "@/components/Loader";
import Link from "next/link";import {useEffect,useState} from "react";import {api} from "@/lib/api";import {uploadImage} from "./ImageUploader";
export default function ProfileView({username,editable}:{username:string;editable?:boolean}){
 const [p,setP]=useState<any>(null);const [bio,setBio]=useState("");const [msg,setMsg]=useState("");
 const load=()=>api("/users/"+username).then(x=>{setP(x);setBio(x.bio||"")}).catch(()=>setP(false));useEffect(()=>{load()},[username]);
 if(p===false)return <p className="p-10 text-center text-muted">Player not found.</p>;if(!p)return <div className="p-8"><Loader/></div>;
 async function avatar(e:React.ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;setMsg("");try{await api("/users/me",{method:"PATCH",body:JSON.stringify({avatarUrl:await uploadImage(f,"avatar")})});load();}catch(x:any){setMsg(x.message)}}
 return(<div className="mx-auto max-w-3xl px-4 py-8 space-y-6"><header className="card p-5 flex gap-4 items-center">
  {p.avatarUrl?<img src={p.avatarUrl} alt={p.username} className="h-20 w-20 rounded-full object-cover"/>:<div className="h-20 w-20 rounded-full bg-primary/10 grid place-items-center text-2xl font-display text-primary">{p.username[0].toUpperCase()}</div>}
  <div className="flex-1"><h1 className="text-2xl">{p.username}</h1><p className="text-sm text-muted">Joined {new Date(p.since).toLocaleDateString()}{p.refereed>0&&<span className="chip bg-primary/10 text-primary ml-2">Referee · {p.refereed} matches</span>}</p>
   {!editable&&p.bio&&<p className="text-sm mt-2">{p.bio}</p>}</div>
  {editable&&<label className="btn-ghost cursor-pointer text-sm">Change photo<input type="file" accept="image/*" className="sr-only" onChange={avatar}/></label>}</header>
  {editable&&<div className="card p-5 space-y-3"><label className="label" htmlFor="b">Bio</label><textarea id="b" maxLength={300} className="input min-h-[80px] py-3" value={bio} onChange={e=>setBio(e.target.value)}/>
   <button className="btn-primary" onClick={()=>api("/users/me",{method:"PATCH",body:JSON.stringify({bio})}).then(()=>setMsg("Saved")).catch(x=>setMsg(x.message))}>Save bio</button>{msg&&<span className="text-sm text-muted ml-3">{msg}</span>}</div>}
  <section><h2 className="text-lg mb-3">Stats</h2>{p.stats.length?<div className="grid sm:grid-cols-2 gap-3">{p.stats.map((s:any)=><div key={s.game} className="card p-4"><p className="font-medium">{s.game}</p>
   <p className="text-sm text-muted">{s.wins}W · {s.losses}L · {s.draws}D · {s.winRate}% win rate</p></div>)}</div>:<p className="text-sm text-muted">No matches played yet.</p>}</section>
  <section><h2 className="text-lg mb-3">Tournament history</h2>{p.tournaments.length?<ul className="space-y-2">{p.tournaments.map((t:any,i:number)=><li key={i} className="card p-3 flex justify-between text-sm">{t.name}<span className={`chip ${t.result==="Champion"?"bg-mint/10 text-mint":"bg-soft border border-line"}`}>{t.result}</span></li>)}</ul>:<p className="text-sm text-muted">No tournaments yet.</p>}</section>
  <section><h2 className="text-lg mb-3">Communities</h2><div className="flex flex-wrap gap-2">{p.joined.map((c:any)=><Link key={c.slug} href={"/communities/"+c.slug} className="chip bg-soft border border-line">{c.name}</Link>)}</div></section></div>);
}
