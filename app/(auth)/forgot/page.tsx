"use client";
import {useState} from "react";import {api} from "@/lib/api";import Turnstile,{CAPTCHA_ON} from "@/components/Turnstile";
export default function Forgot(){
 const [e,setE]=useState("");const [done,setDone]=useState(false);const [cap,setCap]=useState("");const [rk,setRk]=useState(0);const [err,setErr]=useState("");
 if(done)return <div><h1 className="text-2xl">Check your email</h1><p className="text-muted mt-2">If an account exists, a reset link is on its way. It is valid for 30 minutes.</p></div>;
 return(<form onSubmit={async x=>{x.preventDefault();setErr("");try{await api("/auth/forgot",{method:"POST",body:JSON.stringify({email:e,captchaToken:cap})});setDone(true);}catch(y:any){setErr(y.message);setRk(k=>k+1)}}} className="space-y-4"><h1 className="text-2xl">Reset password</h1>
  <div><label className="label" htmlFor="e">Email</label><input id="e" type="email" className="input" value={e} onChange={x=>setE(x.target.value)} required/></div>
  <Turnstile onToken={setCap} resetKey={rk}/>{err&&<p role="alert" className="text-sm text-coral">{err}</p>}<button className="btn-primary w-full" disabled={CAPTCHA_ON&&!cap}>Send reset link</button></form>);
}
