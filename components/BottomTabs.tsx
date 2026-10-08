import Link from "next/link";
import {Home,Users,Plus,Store,User} from "lucide-react";
const t=[[Home,"Home","/"],[Users,"Communities","/communities"],null,[Store,"Store","/store"],[User,"Profile","/profile"]] as const;
export default function BottomTabs(){
 return(<nav aria-label="Tabs" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-line grid grid-cols-5 items-center pb-[env(safe-area-inset-bottom)]">
  {t.map((x,i)=>x?<Link key={i} href={x[2]} className="flex flex-col items-center py-2 text-xs text-muted min-h-[56px] justify-center">{(()=>{const I=x[0];return <I size={22}/>})()}{x[1]}</Link>
  :<div key={i} className="flex justify-center"><button aria-label="Create" className="-mt-6 h-14 w-14 rounded-full bg-primary text-white grid place-items-center shadow-card"><Plus/></button></div>)}
 </nav>);
}
