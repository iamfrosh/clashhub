const BASE="/api"; // same origin: no CORS preflights, no separate server
let token:string|null=null;
export const setToken=(t:string|null)=>{token=t};
export const getToken=()=>token;
// Fetch wrapper: bearer token in memory, one silent refresh (HTTP-only cookie) on 401.
export async function api<T=any>(path:string,opts:RequestInit={}):Promise<T>{
 const call=()=>fetch(BASE+path,{...opts,credentials:"include",headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{}),...(opts.headers||{})}});
 let res=await call();
 if(res.status===401&&!path.startsWith("/auth/")){
  const r=await fetch(BASE+"/auth/refresh",{method:"POST",credentials:"include"});
  if(r.ok){token=(await r.json()).accessToken;res=await call();}}
 const data=await res.json().catch(()=>null);
 if(!res.ok)throw new Error(Array.isArray(data?.message)?data.message[0]:data?.message||"Something went wrong");
 return data;
}
