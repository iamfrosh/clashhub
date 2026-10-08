"use client";
import Loader from "@/components/Loader";
import Link from "next/link";import {useEffect,useState} from "react";import {api} from "@/lib/api";
export default function Leaderboards(){
 const [games,setGames]=useState<any[]>([]);const [game,setGame]=useState("");const [period,setPeriod]=useState("all");const [rows,setRows]=useState<any[]|null>(null);
 useEffect(()=>{api("/communities").then(setGames).catch(()=>{})},[]);
 useEffect(()=>{setRows(null);api(`/leaderboards?period=${period}${game?"&game="+game:""}`).then(setRows).catch(()=>setRows([]))},[game,period]);
 return(<div className="mx-auto max-w-4xl px-4 py-8"><h1 className="text-3xl mb-6">Leaderboards</h1>
  <div className="flex flex-wrap gap-3 mb-6"><select aria-label="Game" className="input sm:max-w-[220px]" value={game} onChange={e=>setGame(e.target.value)}><option value="">Global</option>{games.map(g=><option key={g._id} value={g._id}>{g.name}</option>)}</select>
   <div className="flex rounded-full border border-line overflow-hidden">{[["weekly","Weekly"],["all","All-time"]].map(([k,l])=><button key={k} aria-pressed={period===k} onClick={()=>setPeriod(k)} className={`px-5 min-h-[44px] text-sm ${period===k?"bg-primary text-white":""}`}>{l}</button>)}</div></div>
  {rows===null?<Loader/>:rows.length===0?<p className="text-muted text-center py-16">No ranked matches yet.</p>:
  <div className="card overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-muted"><tr>{["#","Player","W","L","Win rate","Titles"].map(h=><th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
   <tbody>{rows.map(r=><tr key={r.userId} className="border-t border-line"><td className="p-3">{r.rank}</td><td className="p-3"><Link href={"/u/"+r.username} className="text-primary font-medium">{r.username}</Link></td><td className="p-3">{r.wins}</td><td className="p-3">{r.losses}</td><td className="p-3">{r.winRate}%</td><td className="p-3">{r.titles}</td></tr>)}</tbody></table></div>}</div>);
}
