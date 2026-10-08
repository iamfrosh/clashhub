"use client";
import {useEffect,useRef,useState} from "react";import {useRouter} from "next/navigation";import {api} from "@/lib/api";
export default function Verify(){
 const r=useRouter();const [email,setEmail]=useState("");const [d,setD]=useState(["","","","","",""]);const [err,setErr]=useState("");const [cool,setCool]=useState(60);const refs=useRef<HTMLInputElement[]>([]);
 useEffect(()=>{setEmail(new URLSearchParams(location.search).get("email")||"")},[]);
 useEffect(()=>{if(cool<=0)return;const t=setTimeout(()=>setCool(cool-1),1000);return()=>clearTimeout(t)},[cool]);
 async function submit(code:string){setErr("");try{await api("/auth/verify",{method:"POST",body:JSON.stringify({email,code})});r.push("/login?verified=1");}catch(x:any){setErr(x.message)}}
 function put(i:number,v:string){const c=v.replace(/\D/g,"");if(!c)return;const n=[...d];
  c.split("").slice(0,6-i).forEach((ch,k)=>n[i+k]=ch);setD(n);refs.current[Math.min(i+c.length,5)]?.focus();if(n.every(Boolean))submit(n.join(""));}
 return(<div className="space-y-5"><h1 className="text-2xl">Verify your email</h1><p className="text-sm text-muted">Enter the 6-digit code sent to {email||"your email"}. It expires in 10 minutes.</p>
  <div className="flex gap-2" onPaste={e=>{e.preventDefault();put(0,e.clipboardData.getData("text"))}}>{d.map((v,i)=>
   <input key={i} ref={el=>{if(el)refs.current[i]=el}} value={v} inputMode="numeric" maxLength={1} aria-label={`Digit ${i+1}`}
    onChange={e=>put(i,e.target.value)} onKeyDown={e=>{if(e.key==="Backspace"){const n=[...d];n[i]="";setD(n);if(!v)refs.current[i-1]?.focus();}}}
    className="h-14 w-full text-center text-xl rounded-xl bg-soft border border-line focus:bg-white"/>)}</div>
  {err&&<p role="alert" className="text-sm text-coral">{err}</p>}
  <button className="btn-ghost w-full" disabled={cool>0} onClick={async()=>{await api("/auth/resend",{method:"POST",body:JSON.stringify({email})});setCool(60)}}>{cool>0?`Resend in ${cool}s`:"Resend code"}</button></div>);
}
