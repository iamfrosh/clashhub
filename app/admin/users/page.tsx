"use client";
import {useCallback,useEffect,useState} from "react";import {api} from "@/lib/api";
export default function Users(){
 const [q,setQ]=useState("");const [u,setU]=useState<any[]|null>(null);const [err,setErr]=useState("");
 const load=useCallback(()=>{api("/admin/users"+(q?"?q="+encodeURIComponent(q):"")).then(setU).catch(()=>setU([]))},[q]);useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[load]);
 const act=(id:string,action:string,role?:string)=>api("/admin/users/"+id,{method:"PATCH",body:JSON.stringify({action,role})}).then(load).catch(e=>setErr(e.message));
 return(<div className="space-y-4"><h1 className="text-2xl">Users</h1><input type="search" className="input max-w-sm" placeholder="Search username or exact email" aria-label="Search users" value={q} onChange={e=>setQ(e.target.value)}/>{err&&<p role="alert" className="text-coral text-sm">{err}</p>}
  <div className="card overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-muted"><tr>{["User","Email","Role","Status","Actions"].map(h=><th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
   <tbody>{(u||[]).map(x=><tr key={x._id} className="border-t border-line"><td className="p-3">{x.username}</td><td className="p-3">{x.email}{!x.emailVerified&&<span className="chip bg-amber/10 text-amber ml-2">Unverified</span>}</td><td className="p-3">{x.role}</td>
    <td className="p-3"><span className={`chip ${x.status==="active"?"bg-mint/10 text-mint":"bg-coral/10 text-coral"}`}>{x.status}</span></td>
    <td className="p-3"><select aria-label={"Action for "+x.username} className="input min-h-[40px] py-1" value="" onChange={e=>{const v=e.target.value;if(!v)return;if(v.startsWith("role:"))act(x._id,"role",v.slice(5));else act(x._id,v)}}>
     <option value="">Choose action</option>{x.status==="active"?<><option value="suspend">Suspend</option><option value="ban">Ban</option></>:<option value="unban">Reinstate</option>}{!x.emailVerified&&<option value="verify">Verify email</option>}<option value={"role:"+(x.role==="admin"?"member":"admin")}>Make {x.role==="admin"?"member":"admin"}</option></select></td></tr>)}</tbody></table>
   {u&&!u.length&&<p className="p-6 text-center text-muted">No users found.</p>}</div></div>);
}
