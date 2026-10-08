"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {Search,Bell,Menu,X,MessageSquare,User} from "lucide-react";import {useAuth} from "./AuthProvider";
const links=[["Home","/"],["Games Store","/store"],["Communities","/communities"],["Tournaments","/tournaments"],["Leaderboards","/leaderboards"]];
export default function Navbar(){
 const {user,logout}=useAuth();const [scrolled,setS]=useState(false);const [open,setO]=useState(false);
 useEffect(()=>{const f=()=>setS(scrollY>4);f();addEventListener("scroll",f);return()=>removeEventListener("scroll",f)},[]);
 return(<header className={`sticky top-0 z-40 bg-white border-b border-line ${scrolled?"shadow-card":""}`}>
  <nav className="mx-auto max-w-7xl h-16 px-4 flex items-center justify-between" aria-label="Main">
   <Link href="/" className="font-display font-bold text-xl text-primary">ClashHub</Link>
   <ul className="hidden lg:flex gap-8 text-sm font-medium">{links.map(([n,h])=><li key={h}><Link href={h} className="hover:text-primary">{n}</Link></li>)}</ul>
   <div className="hidden lg:flex items-center gap-2">{user?<>
    <Link href="/search" aria-label="Search" className="p-3"><Search size={20}/></Link><Link href="/notifications" aria-label="Notifications" className="p-3"><Bell size={20}/></Link>
    <Link href="/messages" aria-label="Messages" className="p-3"><MessageSquare size={20}/></Link>
    {user.role==="admin"&&<Link href="/admin" className="text-sm font-medium px-2">Admin Panel</Link>}
    <Link href="/profile" aria-label="Profile" className="p-3"><User size={20}/></Link><button onClick={logout} className="text-sm text-muted px-2">Log out</button></>
   :<><Link href="/login" className="text-sm font-medium px-3">Log in</Link><Link href="/signup" className="btn-primary">Join ClashHub</Link></>}</div>
   <div className="flex lg:hidden items-center gap-1">
    <button aria-label="Search" className="p-3"><Search size={22}/></button>
    <button aria-label="Notifications" className="p-3"><Bell size={22}/></button>
    <button aria-label="Menu" onClick={()=>setO(true)} className="p-3"><Menu size={22}/></button></div>
  </nav>
  {open&&<div className="fixed inset-0 z-50 bg-white p-6 lg:hidden">
   <button aria-label="Close" onClick={()=>setO(false)} className="p-3 absolute right-3 top-3"><X/></button>
   <ul className="mt-12 space-y-2">{links.map(([n,h])=><li key={h}><Link onClick={()=>setO(false)} href={h} className="block py-3 text-xl font-display">{n}</Link></li>)}</ul>
   <Link href="/signup" className="btn-primary w-full mt-6">Join ClashHub</Link></div>}
 </header>);
}
