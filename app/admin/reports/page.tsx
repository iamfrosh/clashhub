"use client";
import {useCallback,useEffect,useState} from "react";import {api} from "@/lib/api";
export default function Reports(){
 const [tab,setTab]=useState("Reports");const [r,setR]=useState<any[]>([]);const [a,setA]=useState<any[]>([]);
 const load=useCallback(()=>{api("/admin/reports").then(setR).catch(()=>{});api("/admin/audit").then(setA).catch(()=>{})},[]);useEffect(load,[load]);
 return(<div className="space-y-4"><h1 className="text-2xl">Reports and Audit</h1><div className="flex gap-1">{["Reports","Audit log"].map(t=><button key={t} aria-pressed={tab===t} onClick={()=>setTab(t)} className={`chip min-h-[40px] px-4 border ${tab===t?"bg-primary text-white border-primary":"border-line bg-white"}`}>{t}</button>)}</div>
  {tab==="Reports"?(r.length===0?<p className="text-muted text-sm">No open reports.</p>:<ul className="space-y-2">{r.map(x=><li key={x._id} className="card p-4 flex justify-between gap-3 text-sm"><div><p className="font-medium capitalize">{x.targetType} report</p><p className="text-muted">{x.reason}</p><p className="text-xs text-muted">Target {x.targetId}</p></div>
   <button className="btn-ghost min-h-[40px]" onClick={()=>{const n=prompt("Resolution note");if(n)api("/admin/reports/"+x._id,{method:"PATCH",body:JSON.stringify({resolution:n})}).then(load)}}>Resolve</button></li>)}</ul>)
  :<div className="card overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-muted"><tr>{["When","Action","Target","Actor"].map(h=><th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
   <tbody>{a.map(x=><tr key={x._id} className="border-t border-line"><td className="p-3 whitespace-nowrap">{new Date(x.createdAt).toLocaleString()}</td><td className="p-3">{x.action}</td><td className="p-3 break-all">{x.target}</td><td className="p-3 break-all">{x.actorId}</td></tr>)}</tbody></table></div>}</div>);
}
