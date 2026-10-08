import Link from "next/link";
import GameWall from "@/components/GameWall";import FeaturedListings from "@/components/FeaturedListings";
import {games} from "@/lib/data";
import {Swords,Trophy,ShieldCheck} from "lucide-react";
export default function Home(){
 const steps=[[Swords,"Play","Join a game community and set up refereed matches."],[Trophy,"Compete","Enter tournaments and climb the leaderboards."],[ShieldCheck,"Buy and sell","Every account sale runs through ClashHub admin."]] as const;
 return(<>
  <section className="mx-auto max-w-7xl px-4 py-10 lg:py-16 grid lg:grid-cols-2 gap-10 items-center">
   <div><h1 className="text-4xl lg:text-6xl leading-tight">Your games. Your rivals. One trusted hub.</h1>
    <p className="text-muted mt-4 max-w-md">Join communities, run refereed matches, and buy or sell game accounts through a verified middleman.</p>
    <div className="flex flex-wrap gap-3 mt-8"><Link href="/signup" className="btn-primary">Join ClashHub</Link><Link href="/store" className="btn-ghost">Browse Games for Sale</Link></div></div>
   <GameWall/></section>
  <section className="mx-auto max-w-7xl px-4 py-10"><div className="flex justify-between items-end mb-6"><h2 className="text-2xl">Games for sale</h2><Link href="/store" className="text-primary text-sm font-medium">View all</Link></div>
   <FeaturedListings/></section>
  <section className="mx-auto max-w-7xl px-4 py-10"><h2 className="text-2xl mb-6">Communities</h2>
   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">{games.map(g=><Link key={g.slug} href="/communities" className="card p-4 hover:-translate-y-1 transition">
    <div style={{background:`linear-gradient(160deg,${g.from},${g.to})`}} className="h-12 w-12 rounded-xl mb-3"/><p className="font-semibold text-sm">{g.name}</p><p className="text-xs text-muted">{g.members.toLocaleString()} members</p></Link>)}</div></section>
  <section className="bg-soft py-12 mt-10"><div className="mx-auto max-w-7xl px-4 grid md:grid-cols-3 gap-6">{steps.map(([I,t,d])=><div key={t} className="card p-6"><I className="text-primary mb-3"/><h3 className="text-lg">{t}</h3><p className="text-sm text-muted mt-1">{d}</p></div>)}</div></section>
  <section className="mx-auto max-w-3xl px-4 py-14 text-center"><h2 className="text-2xl">Every sale is verified</h2><p className="text-muted mt-3">Buyers and sellers never talk directly. ClashHub admin checks the account, collects payment and hands it over.</p>
   <Link href="/signup" className="btn-primary mt-6">Join ClashHub</Link></section></>);
}
