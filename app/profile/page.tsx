"use client";
import Loader from "@/components/Loader";
import Link from "next/link";import {useEffect,useState} from "react";import {api} from "@/lib/api";import {useAuth} from "@/components/AuthProvider";import ProfileView from "@/components/ProfileView";
export default function Profile(){
 const {user,ready,logout}=useAuth();const [me,setMe]=useState<any>(null);useEffect(()=>{if(user)api("/users/me").then(setMe).catch(()=>{})},[user]);
 if(ready&&!user)return <p className="p-10 text-center"><Link href="/login?next=/profile" className="text-primary">Log in</Link> to see your profile.</p>;if(!me)return <div className="p-8"><Loader/></div>;
 return(<><ProfileView username={me.username} editable/><nav className="mx-auto max-w-3xl px-4 pb-10 grid sm:grid-cols-3 gap-3 text-sm">
  {[["My Listings","/listings"],["My Purchases","/purchases"],["Referee Dashboard","/referee"],["Messages","/messages"],["Notifications","/notifications"],["My Matches","/matches"],["Settings","/settings"]].map(([l,h])=><Link key={h} href={h} className="card p-4 text-center hover:bg-soft">{l}</Link>)}
  <button onClick={logout} className="card p-4 text-coral">Log out</button></nav></>);
}
