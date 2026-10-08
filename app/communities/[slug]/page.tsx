"use client";
import Loader from "@/components/Loader";
import Link from "next/link";import {use,useCallback,useEffect,useState} from "react";import {Plus} from "lucide-react";
import {api} from "@/lib/api";import {useAuth} from "@/components/AuthProvider";import CommunityChat from "@/components/CommunityChat";import CreateMatch from "@/components/CreateMatch";
const TABS=["Chat","Matches","Members","About"];
export default function Community({params}:{params:Promise<{slug:string}>}){
 const {slug}=use(params);const {user,ready}=useAuth();
 const [c,setC]=useState<any>(null);const [mem,setMem]=useState<any[]|null>(null);const [matches,setMatches]=useState<any[]>([]);const [tab,setTab]=useState("Chat");const [wiz,setWiz]=useState(false);const [missing,setMissing]=useState(false);const [blocked,setBlocked]=useState<string[]>([]);
 const load=useCallback(async()=>{const cm=await api("/communities/"+slug).catch(()=>null);if(!cm)return setMissing(true);setC(cm);
  if(user){api("/users/me").then(m=>setBlocked((m.blocked||[]).map((b:any)=>b._id))).catch(()=>{});api(`/communities/${cm._id}/members`).then(setMem).catch(()=>setMem(null));api("/matches?communityId="+cm._id).then(setMatches).catch(()=>{});}},[slug,user]);
 useEffect(()=>{if(ready)load()},[ready,load]);
 if(missing)return <p className="p-8 text-center text-muted">Community not found.</p>;if(!c)return <div className="p-8"><Loader/></div>;
 const members=(mem||[]).filter(m=>m.userId);const names:Record<string,string>=Object.fromEntries(members.map(m=>[m.userId._id,m.userId.username]));
 const badges:Record<string,string>=Object.fromEntries(members.filter(m=>m.role==="moderator").map(m=>[m.userId._id,"Moderator"]));
 const canMod=user?.role==="admin"||members.some(m=>m.userId._id===user?.id&&m.role==="moderator");
 const act=async(p:string)=>{await api(`/communities/${c._id}/${p}`,{method:"POST"});load();};
 return(<div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
  <header className="card p-5 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl">{c.name}</h1><p className="text-sm text-muted">{c.memberCount} members</p></div>
   <div className="flex gap-2">{!user?<Link href={`/login?next=/communities/${slug}`} className="btn-primary">Log in to join</Link>:mem?<>
    <button className="btn-primary" onClick={()=>setWiz(true)}><Plus size={18}/>Create Match</button><button className="btn-ghost" onClick={()=>act("leave")}>Leave</button></>
    :<button className="btn-primary" onClick={()=>act("join")}>Join</button>}</div></header>
  <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">{TABS.map(t=><button key={t} role="tab" aria-selected={tab===t} onClick={()=>setTab(t)}
   className={`px-4 min-h-[44px] text-sm font-medium border-b-2 ${tab===t?"border-primary text-primary":"border-transparent text-muted"}`}>{t}</button>)}</div>
  {tab==="Chat"&&(mem?<CommunityChat communityId={c._id} names={names} badges={badges} canMod={!!canMod} blocked={blocked}/>:<p className="text-muted text-center py-10">Join this community to chat.</p>)}
  {tab==="Matches"&&(matches.length?<ul className="space-y-3">{matches.map(m=><li key={m._id} className="card p-4 flex justify-between items-center gap-3"><div>
   <p className="font-medium text-sm">{m.teams?.length?m.teams.map((t:any)=>t.name).join(" vs "):m.participants.map((p:string)=>names[p]||"Player").join(" vs ")}</p>
   <p className="text-xs text-muted">{new Date(m.scheduledAt).toLocaleString()}{m.result&&` · ${m.result.scores.join(" - ")}`}</p></div>
   {m.status==="Live"?<span className="chip bg-coral text-white">LIVE</span>:<span className="chip bg-soft border border-line">{m.status}</span>}</li>)}</ul>:<p className="text-muted text-center py-10">No matches yet.</p>)}
  {tab==="Members"&&(mem?<ul className="grid sm:grid-cols-2 gap-3">{members.map(m=><li key={m._id} className="card p-3 text-sm flex justify-between">{m.userId.username}{m.role==="moderator"&&<span className="chip bg-primary/10 text-primary">Moderator</span>}</li>)}</ul>:<p className="text-muted text-center py-10">Join to see members.</p>)}
  {tab==="About"&&<div className="card p-5 space-y-3 text-sm"><p>{c.description||"No description yet."}</p><h2 className="text-base">Rules</h2><p className="whitespace-pre-line text-muted">{c.rules||"Be respectful. No phone numbers or external links."}</p></div>}
  {wiz&&user&&<CreateMatch communityId={c._id} me={user.id} members={members.map(m=>({_id:m.userId._id,name:m.userId.username}))} onClose={()=>setWiz(false)} onDone={()=>{setWiz(false);load();setTab("Matches")}}/>}
 </div>);
}
