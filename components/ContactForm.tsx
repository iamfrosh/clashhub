"use client";
import {useState} from "react";import {api} from "@/lib/api";import Turnstile,{CAPTCHA_ON} from "./Turnstile";
export default function ContactForm(){
 const [f,setF]=useState({name:"",email:"",message:"",website:""});const [msg,setMsg]=useState("");const [done,setDone]=useState(false);const [cap,setCap]=useState("");const [rk,setRk]=useState(0);const set=(k:string)=>(e:any)=>setF({...f,[k]:e.target.value});
 if(done)return <p className="card p-5">Thanks. We will reply by email.</p>;
 return(<form onSubmit={async e=>{e.preventDefault();setMsg("");try{await api("/public/contact",{method:"POST",body:JSON.stringify({...f,captchaToken:cap})});setDone(true);}catch(x:any){setMsg(x.message);setRk(k=>k+1)}}} className="space-y-3 mt-6">
  <input className="input" placeholder="Name" aria-label="Name" value={f.name} onChange={set("name")} required/><input type="email" className="input" placeholder="Email" aria-label="Email" value={f.email} onChange={set("email")} required/>
  <textarea className="input min-h-[120px] py-3" placeholder="Message" aria-label="Message" maxLength={2000} value={f.message} onChange={set("message")} required/>
  <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set("website")} className="absolute -left-[9999px] h-0 w-0 opacity-0" name="website"/>
  <Turnstile onToken={setCap} resetKey={rk}/>{msg&&<p role="alert" className="text-sm text-coral">{msg}</p>}<button className="btn-primary" disabled={CAPTCHA_ON&&!cap}>Send message</button></form>);
}
