import {games} from "@/lib/data";
function Col({rev,items}:{rev?:boolean;items:typeof games}){
 const c=[...items,...items];
 return(<div className="overflow-hidden h-full"><div className={`wall-col ${rev?"rev":""} flex flex-col gap-4`}>
  {c.map((g,i)=><div key={i} aria-hidden={i>=items.length} style={{background:`linear-gradient(160deg,${g.from},${g.to})`,transform:`rotate(${i%2?-2:2}deg)`}}
   className="rounded-card aspect-[3/4] p-3 flex items-end text-white font-display font-semibold text-sm">{g.name}</div>)}</div></div>);
}
export default function GameWall(){
 const a=games.filter((_,i)=>i%3===0),b=games.filter((_,i)=>i%3===1),c=games.filter((_,i)=>i%3===2);
 return(<div className="wall wall-mask h-[420px] md:h-[520px] rounded-card border border-line bg-white p-4 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-hidden" role="img" aria-label="Game covers">
  <Col items={a}/><Col rev items={b}/><div className="hidden md:block h-full"><Col items={c}/></div></div>);
}
