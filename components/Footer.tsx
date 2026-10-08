import Link from "next/link";import CookieSettingsButton from "./CookieSettingsButton";
const cols:Record<string,string[]>={Platform:["Store","Communities","Tournaments","Leaderboards"],Company:["About","Contact","Trust and Safety"],Legal:["Terms","Privacy","Marketplace Rules"],Support:["How to buy","How to sell","FAQ"]};
const LINKS:Record<string,string>={Store:"/store",Communities:"/communities",Tournaments:"/tournaments",Leaderboards:"/leaderboards",About:"/about",Contact:"/contact","Trust and Safety":"/trust-and-safety",Terms:"/terms",Privacy:"/privacy","Marketplace Rules":"/marketplace-rules",Cookies:"/cookies","How to buy":"/how-to-buy","How to sell":"/how-to-sell",FAQ:"/faq"};
export default function Footer(){
 return(<footer className="bg-soft border-t border-line mt-20 pb-24 lg:pb-0"><div className="mx-auto max-w-7xl px-4 py-12 grid gap-8 md:grid-cols-5">
  <div><p className="font-display font-bold text-xl text-primary">ClashHub</p><p className="text-sm text-muted mt-2">Play, compete, buy and sell. Every sale verified.</p></div>
  {Object.entries(cols).map(([h,l])=><details key={h} className="md:open group" open><summary className="font-semibold cursor-pointer md:pointer-events-none py-2">{h}</summary>
   <ul className="space-y-2 text-sm text-muted">{l.map(x=><li key={x}><Link href={LINKS[x]||"/"} className="hover:text-primary">{x}</Link></li>)}</ul></details>)}
 </div><p className="text-center text-xs text-muted pb-2">© 2026 ClashHub. All rights reserved.</p><div className="flex justify-center gap-4 text-xs text-muted pb-6"><Link href="/cookies" className="hover:text-primary">Cookie Policy</Link><CookieSettingsButton/></div></footer>);
}
