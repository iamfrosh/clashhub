import type {MetadataRoute} from "next";import {PAGES} from "@/lib/pages";
const SITE=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000",API=SITE+"/api";
export const revalidate=3600;
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const now=new Date();const fixed=["","/store","/communities","/tournaments","/leaderboards",...Object.keys(PAGES).map(s=>"/"+s)].map(p=>({url:SITE+p,lastModified:now}));
 let dyn:MetadataRoute.Sitemap=[];
 try{const r=await fetch(API+"/listings",{next:{revalidate:3600}});if(r.ok)dyn=(await r.json()).map((l:any)=>({url:`${SITE}/store/${l.id}`,lastModified:new Date(l.createdAt)}));}catch{}
 return [...fixed,...dyn];
}
