"use client";
import {useEffect,useState} from "react";import ListingCard from "./ListingCard";import {api} from "@/lib/api";
export default function FeaturedListings(){
 const [items,setItems]=useState<any[]|null>(null);
 useEffect(()=>{api("/listings").then(r=>setItems(r.slice(0,4).map((l:any)=>({...l,image:l.images?.[0]})))).catch(()=>setItems([]))},[]);
 if(items===null)return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[0,1,2,3].map(i=><div key={i} className="h-64 rounded-card bg-soft animate-pulse"/>)}</div>;
 if(!items.length)return <p className="text-muted text-sm">No accounts for sale yet. Check back soon.</p>;
 return <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto snap-x">{items.map(l=><div key={l.id} className="min-w-[70%] md:min-w-0 snap-start"><ListingCard l={l}/></div>)}</div>;
}
