"use client";
const rname=(i:number,n:number,f:string)=>f==="round_robin"?`Round ${i+1}`:i===n-1?"Final":i===n-2?"Semi-finals":i===n-3?"Quarter-finals":`Round ${i+1}`;
export default function Bracket({t,names,canReport,onReport}:{t:any;names:Record<string,string>;canReport:boolean;onReport:(round:number,index:number,winnerId:string)=>void}){
 if(!t.bracket?.length)return <p className="text-muted text-sm">The bracket is drawn when registration closes.</p>;
 return(<div className="overflow-x-auto"><div className="flex gap-8 min-w-max p-2">{t.bracket.map((r:any,ri:number)=><div key={ri} className="flex flex-col justify-around gap-4 min-w-[190px]">
  <p className="text-xs font-medium text-muted">{rname(ri,t.bracket.length,t.format)}</p>
  {r.matches.map((m:any,mi:number)=><div key={mi} className="card p-1">{[m.a,m.b].map((p:string,i:number)=>{const can=canReport&&!!m.a&&!!m.b&&!m.winner&&!!p;
   return <button key={i} disabled={!can} onClick={()=>onReport(ri,mi,p)} className={`w-full text-left px-3 min-h-[44px] rounded-xl text-sm ${m.winner&&m.winner===p?"bg-mint/10 text-mint font-medium":""} ${can?"hover:bg-soft":""}`}>{p?names[p]||"Player":"TBD"}</button>})}</div>)}</div>)}</div></div>);
}
