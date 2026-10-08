import Link from "next/link";import {naira} from "@/lib/data";
type L={id:string;title:string;price:number;game?:string;badge?:string;status:string;from?:string;to?:string;image?:string};
const bc:Record<string,string>={New:"bg-primary/10 text-primary",Hot:"bg-coral/10 text-coral",Discount:"bg-mint/10 text-mint"};
export default function ListingCard({l}:{l:L}){
 return(<Link href={`/store/${l.id}`} className="card block overflow-hidden hover:-translate-y-1 transition motion-reduce:transition-none">
  {l.image?<img src={l.image} alt={l.title} loading="lazy" className="aspect-[4/3] w-full object-cover"/>:<div style={{background:`linear-gradient(160deg,${l.from||"#5B4CFF"},${l.to||"#141824"})`}} className="aspect-[4/3] p-3 text-white font-display">{l.game}</div>}
  <div className="p-4 space-y-2"><div className="flex justify-between items-start gap-2"><h3 className="text-base leading-snug">{l.title}</h3>
   {l.status==="Reserved"?<span className="chip bg-amber/10 text-amber">Reserved</span>:l.badge&&<span className={`chip ${bc[l.badge]||""}`}>{l.badge}</span>}</div>
   <p className="font-semibold">{naira(l.price)}</p><span className="btn-primary w-full text-sm">Buy</span></div></Link>);
}
