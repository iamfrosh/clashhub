"use client";
import {useState} from "react";import Link from "next/link";import {useRouter} from "next/navigation";import {api} from "@/lib/api";import Turnstile,{CAPTCHA_ON} from "@/components/Turnstile";
const score=(p:string)=>[p.length>=8,/[A-Z]/.test(p),/[0-9]/.test(p),/[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
export default function Signup(){
 const r=useRouter();const [f,setF]=useState({username:"",email:"",password:"",confirm:"",terms:false});const [err,setErr]=useState("");const [busy,setBusy]=useState(false);const [cap,setCap]=useState("");const [rk,setRk]=useState(0);
 const s=score(f.password),set=(k:string)=>(e:any)=>setF({...f,[k]:e.target.type==="checkbox"?e.target.checked:e.target.value});
 async function submit(e:React.FormEvent){e.preventDefault();setErr("");
  if(f.password!==f.confirm)return setErr("Passwords do not match");if(s<3||!/\d/.test(f.password)||!/[A-Za-z]/.test(f.password))return setErr("Use 8+ characters with letters and numbers");if(!f.terms)return setErr("Accept the Terms to continue");
  setBusy(true);try{await api("/auth/signup",{method:"POST",body:JSON.stringify({username:f.username,email:f.email,password:f.password,captchaToken:cap})});r.push("/verify?email="+encodeURIComponent(f.email));}
  catch(x:any){setErr(x.message);setRk(k=>k+1)}finally{setBusy(false)}}
 return(<form onSubmit={submit} className="space-y-4"><h1 className="text-2xl">Join ClashHub</h1>
  <div><label className="label" htmlFor="u">Username</label><input id="u" className="input" value={f.username} onChange={set("username")} required pattern="[A-Za-z0-9_]{3,20}" autoComplete="username"/></div>
  <div><label className="label" htmlFor="e">Email</label><input id="e" type="email" className="input" value={f.email} onChange={set("email")} required autoComplete="email"/></div>
  <div><label className="label" htmlFor="p">Password</label><input id="p" type="password" className="input" value={f.password} onChange={set("password")} required autoComplete="new-password"/>
   <div className="flex gap-1 mt-2" aria-label={`Strength ${s} of 4`}>{[1,2,3,4].map(i=><span key={i} className={`h-1.5 flex-1 rounded-full ${i<=s?(s<3?"bg-amber":"bg-mint"):"bg-line"}`}/>)}</div></div>
  <div><label className="label" htmlFor="c">Confirm password</label><input id="c" type="password" className="input" value={f.confirm} onChange={set("confirm")} required autoComplete="new-password"/></div>
  <label className="flex gap-2 text-sm items-start"><input type="checkbox" className="mt-1 h-5 w-5" checked={f.terms} onChange={set("terms")}/>I agree to the <Link href="/terms" className="text-primary">Terms</Link></label>
  {err&&<p role="alert" className="text-sm text-coral">{err}</p>}
  <Turnstile onToken={setCap} resetKey={rk}/>
  <button className="btn-primary w-full" disabled={busy||(CAPTCHA_ON&&!cap)}>{busy?"Creating account...":"Create account"}</button>
  <p className="text-sm text-muted text-center">Have an account? <Link href="/login" className="text-primary">Log in</Link></p></form>);
}
