"use client";
import {useEffect,useRef,useState} from "react";import {api} from "@/lib/api";import {naira} from "@/lib/data";import {uploadImage} from "./ImageUploader";
const ZERO="000000000000000000000000";
export default function PrivateChat({id,me,other="ClashHub Support"}:{id:string;me:string;other?:string}){
 const [msgs,setMsgs]=useState<any[]>([]);const [text,setText]=useState("");const [err,setErr]=useState("");const last=useRef("");const end=useRef<HTMLDivElement>(null);
 useEffect(()=>{let alive=true;api(`/chat/conversations/${id}/messages`).then(r=>{if(!alive)return;setMsgs(r.messages);last.current=r.messages.at(-1)?._id||"";api(`/chat/conversations/${id}/read`,{method:"POST"}).catch(()=>{});}).catch(e=>setErr(e.message));return()=>{alive=false}},[id]);
 useEffect(()=>{const t=setInterval(async()=>{if(document.hidden)return;try{const r=await api(`/chat/conversations/${id}/messages?after=${last.current||ZERO}`);
  if(r.messages.length){last.current=r.messages.at(-1)._id;setMsgs(x=>[...x,...r.messages.filter((m:any)=>!x.some(y=>y._id===m._id))]);api(`/chat/conversations/${id}/read`,{method:"POST"}).catch(()=>{});}}catch{}},3000);return()=>clearInterval(t)},[id]);
 useEffect(()=>{end.current?.scrollIntoView({behavior:"smooth"})},[msgs.length]);
 async function send(t:string,attachments:string[]=[]){setErr("");try{const m=await api(`/chat/conversations/${id}/send`,{method:"POST",body:JSON.stringify({text:t,attachments})});last.current=m._id;setMsgs(x=>x.some(y=>y._id===m._id)?x:[...x,m]);return true}catch(x:any){setErr(x.message);return false}}
 async function proof(e:React.ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;try{await send("",[await uploadImage(f,"chat")]);}catch(x:any){setErr(x.message)}e.target.value="";}
 return(<div className="card flex flex-col h-[70vh]"><ul className="flex-1 overflow-y-auto p-4 space-y-3">{msgs.map(m=>{const mine=m.senderId===me;
  if(m.type==="listingCard"){const c=JSON.parse(m.text);return <li key={m._id} className="card p-3 flex gap-3 items-center bg-soft">{c.image&&<img src={c.image} alt="" loading="lazy" decoding="async" className="h-14 w-14 rounded-xl object-cover"/>}<div className="text-sm"><p className="font-medium">{c.title}</p><p className="text-muted">{naira(c.price)} · ID CH-{String(c.id).slice(-6).toUpperCase()}</p></div></li>;}
  return <li key={m._id} className={`flex ${mine?"justify-end":""}`}><div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine?"bg-primary text-white":"bg-soft"}`}>
   {!mine&&<p className="text-xs font-semibold mb-0.5">{other}</p>}{m.text&&<p className="break-words whitespace-pre-line">{m.text}</p>}
   {m.attachments?.map((a:string)=><img key={a} src={a} alt="Attachment" loading="lazy" decoding="async" className="mt-2 rounded-xl max-h-60"/>)}</div></li>;})}<div ref={end}/></ul>
  {err&&<p role="alert" className="text-sm text-coral px-4">{err}</p>}
  <form onSubmit={async e=>{e.preventDefault();if(text.trim()){const t=text;setText("");if(!(await send(t)))setText(t)}}} className="border-t border-line p-3 flex gap-2">
   <label className="btn-ghost cursor-pointer px-4" title="Upload proof of payment">Photo<input type="file" accept="image/*" className="sr-only" onChange={proof}/></label>
   <input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="Message" aria-label="Message" maxLength={2000}/><button className="btn-primary">Send</button></form></div>);
}
