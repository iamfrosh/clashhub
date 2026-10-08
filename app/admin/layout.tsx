"use client";
import Loader from "@/components/Loader";
import Link from "next/link";import {usePathname} from "next/navigation";import {useState} from "react";import {Menu,X} from "lucide-react";import {useAuth} from "@/components/AuthProvider";
const NAV=[["Dashboard","/admin"],["Users","/admin/users"],["Communities","/admin/communities"],["Listings","/admin/listings"],["Deals","/admin/deals"],["Matches and Disputes","/admin/matches"],["Inbox","/admin/inbox"],["Email Centre","/admin/email"],["Reports and Audit","/admin/reports"],["Settings","/admin/settings"]];
export default function AdminLayout({children}:{children:React.ReactNode}){
 const {user,ready}=useAuth();const p=usePathname();const [open,setOpen]=useState(false);
 if(!ready)return <div className="p-8"><Loader/></div>;
 if(user?.role!=="admin")return <p className="p-10 text-center text-muted">Admin access only.</p>;
 return(<div className="lg:flex min-h-[calc(100vh-4rem)]">
  <div className="lg:hidden flex items-center justify-between border-b border-line px-4 h-14"><span className="font-display font-semibold">Admin</span><button aria-label="Open menu" onClick={()=>setOpen(true)} className="p-3"><Menu/></button></div>
  <aside className={`${open?"fixed inset-0 z-50 bg-white overflow-y-auto":"hidden"} lg:block lg:static lg:w-60 lg:shrink-0 border-r border-line p-4`}>
   <div className="flex justify-between items-center mb-4 lg:hidden"><span className="font-display font-semibold">Admin</span><button aria-label="Close menu" onClick={()=>setOpen(false)} className="p-3"><X/></button></div>
   <nav aria-label="Admin"><ul className="space-y-1">{NAV.map(([l,h])=><li key={h}><Link href={h} onClick={()=>setOpen(false)} className={`block px-3 min-h-[44px] leading-[44px] rounded-xl text-sm ${p===h?"bg-primary/10 text-primary font-medium":"hover:bg-soft"}`}>{l}</Link></li>)}</ul></nav></aside>
  <div className="flex-1 min-w-0 p-4 lg:p-8 bg-soft/50 pb-24">{children}</div></div>);
}
