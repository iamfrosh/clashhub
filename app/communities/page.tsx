import Link from "next/link";import {games} from "@/lib/data";
export default function Communities(){
 return(<div className="mx-auto max-w-7xl px-4 py-8"><h1 className="text-3xl mb-6">Communities</h1>
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{games.map(g=><div key={g.slug} className="card overflow-hidden">
   <div style={{background:`linear-gradient(160deg,${g.from},${g.to})`}} className="h-28"/><div className="p-4 flex justify-between items-center">
   <div><h3 className="text-lg">{g.name}</h3><p className="text-xs text-muted">{g.members.toLocaleString()} members · {g.live} live</p></div><Link href={"/communities/"+g.slug} className="btn-primary text-sm">Open</Link></div></div>)}</div></div>);
}
