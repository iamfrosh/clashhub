"use client";
import {createContext,useContext,useEffect,useState,useCallback} from "react";
import {api,setToken} from "@/lib/api";
type U={id:string;role:"member"|"admin";verified:boolean}|null;
const Ctx=createContext<{user:U;ready:boolean;login:(i:string,p:string,c?:string)=>Promise<boolean>;logout:()=>Promise<void>}>(null as any);
export const useAuth=()=>useContext(Ctx);
const decode=(t:string):U=>{const p=JSON.parse(atob(t.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));return {id:p.sub,role:p.role,verified:p.verified};};
export default function AuthProvider({children}:{children:React.ReactNode}){
 const [user,setUser]=useState<U>(null);const [ready,setReady]=useState(false);
 const apply=useCallback((t:string)=>{setToken(t);setUser(decode(t));},[]);
 useEffect(()=>{api("/auth/refresh",{method:"POST"}).then(r=>apply(r.accessToken)).catch(()=>{}).finally(()=>setReady(true));},[apply]);
 const login=async(identifier:string,password:string,captchaToken?:string)=>{const r=await api("/auth/login",{method:"POST",body:JSON.stringify({identifier,password,captchaToken})});apply(r.accessToken);return !!r.firstLogin;};
 const logout=async()=>{await api("/auth/logout",{method:"POST"}).catch(()=>{});setToken(null);setUser(null);};
 return <Ctx.Provider value={{user,ready,login,logout}}>{children}</Ctx.Provider>;
}
