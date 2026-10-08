"use client";
import {useState} from "react";import {useRouter} from "next/navigation";import {api} from "@/lib/api";
export default function Reset(){
 const r=useRouter();const [p,setP]=useState("");const [c,setC]=useState("");const [err,setErr]=useState("");
 return(<form onSubmit={async x=>{x.preventDefault();setErr("");if(p!==c)return setErr("Passwords do not match");
  try{await api("/auth/reset",{method:"POST",body:JSON.stringify({token:new URLSearchParams(location.search).get("token"),password:p})});r.push("/login");}catch(y:any){setErr(y.message)}}} className="space-y-4">
  <h1 className="text-2xl">Choose a new password</h1>
  <div><label className="label" htmlFor="p">New password</label><input id="p" type="password" minLength={8} className="input" value={p} onChange={x=>setP(x.target.value)} required autoComplete="new-password"/></div>
  <div><label className="label" htmlFor="c">Confirm password</label><input id="c" type="password" className="input" value={c} onChange={x=>setC(x.target.value)} required autoComplete="new-password"/></div>
  {err&&<p role="alert" className="text-sm text-coral">{err}</p>}<button className="btn-primary w-full">Update password</button></form>);
}
