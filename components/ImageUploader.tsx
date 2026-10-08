"use client";
import {useState} from "react";import {api} from "@/lib/api";
async function toWebp(f:File):Promise<Blob>{
 const bmp=await createImageBitmap(f);const s=Math.min(1,1600/Math.max(bmp.width,bmp.height));const c=document.createElement("canvas");
 c.width=Math.round(bmp.width*s);c.height=Math.round(bmp.height*s);c.getContext("2d")!.drawImage(bmp,0,0,c.width,c.height);
 return new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(new Error("Could not process image")),"image/webp",.82));}
// Compress to WebP in the browser, then upload straight to S3 with a short-lived presigned URL.
export async function uploadImage(f:File,kind:string):Promise<string>{
 if(!f.type.startsWith("image/"))throw new Error("Please choose an image");const b=await toWebp(f);
 const {uploadUrl,publicUrl}=await api("/uploads/presign",{method:"POST",body:JSON.stringify({type:"image/webp",size:b.size,kind})});
 const r=await fetch(uploadUrl,{method:"PUT",headers:{"Content-Type":"image/webp"},body:b});if(!r.ok)throw new Error("Upload failed");return publicUrl;}
export default function ImageUploader({value,onChange,max=6,kind="listing"}:{value:string[];onChange:(v:string[])=>void;max?:number;kind?:string}){
 const [busy,setBusy]=useState(false);const [err,setErr]=useState("");
 async function pick(e:React.ChangeEvent<HTMLInputElement>){setErr("");setBusy(true);const out=[...value];
  try{for(const f of Array.from(e.target.files||[]).slice(0,max-value.length))out.push(await uploadImage(f,kind));onChange(out);}catch(x:any){setErr(x.message);onChange(out)}finally{setBusy(false);e.target.value=""}}
 return(<div><div className="flex flex-wrap gap-2">{value.map((u,i)=><div key={u} className="relative h-20 w-20"><img src={u} alt={`Upload ${i+1}`} className="h-20 w-20 object-cover rounded-xl border border-line"/>
  <button type="button" aria-label="Remove image" onClick={()=>onChange(value.filter(x=>x!==u))} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-ink text-white text-xs">x</button></div>)}
  {value.length<max&&<label className="h-20 w-20 rounded-xl border border-dashed border-line grid place-items-center text-xs text-muted cursor-pointer focus-within:ring-2">{busy?"...":"Add"}<input type="file" accept="image/*" multiple className="sr-only" onChange={pick} disabled={busy}/></label>}</div>
  {err&&<p role="alert" className="text-sm text-coral mt-2">{err}</p>}</div>);
}
