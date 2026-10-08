"use client";
import {useEffect,useState} from "react";import ListingCard from "@/components/ListingCard";import {api} from "@/lib/api";
export default function Store(){
 const [items,setItems]=useState<any[]|null>(null);const [games,setGames]=useState<any[]>([]);const [game,setGame]=useState("");const [q,setQ]=useState("");const [sort,setSort]=useState("new");
 useEffect(()=>{api("/communities").then(setGames).catch(()=>{})},[]);
 useEffect(()=>{setItems(null);api("/listings"+(game?"?game="+game:"")).then(r=>setItems(r.map((l:any)=>({...l,image:l.images?.[0]})))).catch(()=>setItems([]))},[game]);
 const shown=(items||[]).filter(l=>l.title.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>sort==="cheap"?a.price-b.price:0);
 return(<div className="mx-auto max-w-7xl px-4 py-8"><h1 className="text-3xl mb-6">Games Store</h1>
  <div className="flex flex-wrap gap-3 mb-6"><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search accounts" aria-label="Search" className="input sm:max-w-xs"/>
   <select aria-label="Game" className="input sm:max-w-[200px]" value={game} onChange={e=>setGame(e.target.value)}><option value="">All games</option>{games.map(g=><option key={g._id} value={g._id}>{g.name}</option>)}</select>
   <select aria-label="Sort" className="input sm:max-w-[200px]" value={sort} onChange={e=>setSort(e.target.value)}><option value="new">Newest</option><option value="cheap">Cheapest</option></select></div>
  {items===null?<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[0,1,2,3].map(i=><div key={i} className="h-64 rounded-card bg-soft animate-pulse"/>)}</div>
  :shown.length?<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{shown.map(l=><ListingCard key={l.id} l={l}/>)}</div>:<p className="text-muted text-center py-16">No listings match. Try another game or search.</p>}</div>);
}
