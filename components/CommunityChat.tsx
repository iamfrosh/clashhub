"use client";
import {useEffect,useRef,useState} from "react";import {api} from "@/lib/api";
const ZERO="000000000000000000000000";
// Chat by short polling (new messages every 3s while the tab is visible), so it works on serverless hosting.
export default function CommunityChat({communityId,names,badges,canMod,blocked=[]}:{communityId:string;names:Record<string,string>;badges:Record<string,string>;canMod:boolean;blocked?:string[]}){
 const [msgs,setMsgs]=useState<any[]>([]);const [cid,setCid]=useState("");const [text,setText]=useState("");const [err,setErr]=useState("");const last=useRef("");const end=useRef<HTMLDivElement>(null);
 useEffect(()=>{let alive=true;api(`/chat/community/${communityId}/room`).then(r=>{if(!alive)return;setCid(r.conversationId);setMsgs(r.messages);last.current=r.messages.at(-1)?._id||"";api(`/chat/conversations/${r.conversationId}/read`,{method:"POST"}).catch(()=>{});}).catch(e=>setErr(e.message));return()=>{alive=false}},[communityId]);
 useEffect(()=>{if(!cid)return;const t=setInterval(async()=>{if(document.hidden)return;
  try{const r=await api(`/chat/conversations/${cid}/messages?after=${last.current||ZERO}`);
   if(r.messages.length){last.current=r.messages.at(-1)._id;setMsgs(x=>[...x,...r.messages.filter((m:any)=>!x.some(y=>y._id===m._id))]);api(`/chat/conversations/${cid}/read`,{method:"POST"}).catch(()=>{});}
   if(r.deleted.length)setMsgs(x=>x.filter(m=>!r.deleted.includes(m._id)));}catch{}},3000);return()=>clearInterval(t)},[cid]);
 useEffect(()=>{end.current?.scrollIntoView({behavior:"smooth"})},[msgs.length]);
 async function send(e:React.FormEvent){e.preventDefault();if(!text.trim())return;setErr("");const t=text;setText("");
  try{const m=await api(`/chat/conversations/${cid}/send`,{method:"POST",body:JSON.stringify({text:t})});last.current=m._id;setMsgs(x=>x.some(y=>y._id===m._id)?x:[...x,m]);}catch(x:any){setErr(x.message);setText(t)}}
 return(<div className="card flex flex-col h-[70vh]">
  <ul className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite">{msgs.length===0&&<li className="text-muted text-sm text-center mt-10">No messages yet. Say hello.</li>}
   {msgs.filter(m=>!blocked.includes(m.senderId)).map(m=><li key={m._id} className="group text-sm"><span className="font-semibold">{names[m.senderId]||"Player"}</span>
    {badges[m.senderId]&&<span className="chip bg-primary/10 text-primary ml-2">{badges[m.senderId]}</span>}
    <span className="text-muted text-xs ml-2">{new Date(m.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
    <p className="mt-0.5 break-words">{m.text}</p>
    <span className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 text-xs text-muted space-x-3">
     <button onClick={()=>api("/chat/report",{method:"POST",body:JSON.stringify({targetType:"message",targetId:m._id,reason:"Reported from chat"})})}>Report</button>
     {canMod&&<button onClick={()=>api(`/chat/messages/${m._id}`,{method:"DELETE"}).then(()=>setMsgs(x=>x.filter(y=>y._id!==m._id)))} className="text-coral">Delete</button>}</span></li>)}<div ref={end}/></ul>
  <form onSubmit={send} className="border-t border-line p-3 flex gap-2"><input value={text} onChange={e=>setText(e.target.value)} maxLength={2000} placeholder="Message" aria-label="Message" className="input"/><button className="btn-primary">Send</button></form>
  {err&&<p role="alert" className="text-sm text-coral px-4 pb-3">{err}</p>}</div>);
}
