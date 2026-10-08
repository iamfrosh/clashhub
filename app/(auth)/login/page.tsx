"use client";
import {useState} from "react";import Link from "next/link";import {useRouter} from "next/navigation";import {useAuth} from "@/components/AuthProvider";import Turnstile,{CAPTCHA_ON} from "@/components/Turnstile";
export default function Login(){
 const r=useRouter();const {login}=useAuth();const [id,setId]=useState("");const [pw,setPw]=useState("");const [err,setErr]=useState("");const [busy,setBusy]=useState(false);const [cap,setCap]=useState("");const [rk,setRk]=useState(0);
 async function submit(e:React.FormEvent){e.preventDefault();setErr("");setBusy(true);
  try{const first=await login(id,pw,cap);const n=new URLSearchParams(location.search).get("next");r.push(first?"/onboarding":n&&n.startsWith("/")?n:"/");}catch(x:any){setErr(x.message);setRk(k=>k+1)}finally{setBusy(false)}}
 if(/suspend/i.test(err))return <div className="space-y-3"><h1 className="text-2xl">Account suspended</h1><p className="text-muted text-sm">Your account has been suspended. Contact ClashHub Support to find out why or to appeal.</p><Link href="/contact" className="btn-primary">Contact support</Link></div>;
 return(<form onSubmit={submit} className="space-y-4"><h1 className="text-2xl">Welcome back</h1>
  <div><label className="label" htmlFor="i">Email or username</label><input id="i" className="input" value={id} onChange={e=>setId(e.target.value)} required autoComplete="username"/></div>
  <div><label className="label" htmlFor="p">Password</label><input id="p" type="password" className="input" value={pw} onChange={e=>setPw(e.target.value)} required autoComplete="current-password"/></div>
  <div className="text-sm text-right"><Link href="/forgot" className="text-primary">Forgot password?</Link></div>
  {err&&<p role="alert" className="text-sm text-coral">{err}</p>}
  <Turnstile onToken={setCap} resetKey={rk}/>
  <button className="btn-primary w-full" disabled={busy||(CAPTCHA_ON&&!cap)}>{busy?"Logging in...":"Log in"}</button>
  <p className="text-sm text-muted text-center">New here? <Link href="/signup" className="text-primary">Join ClashHub</Link></p></form>);
}
