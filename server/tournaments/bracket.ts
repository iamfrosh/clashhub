export type Rounds={matches:{a?:string;b?:string;winner?:string}[]}[];
// Single elimination: pad to a power of two; players paired with a bye advance automatically.
export function singleElimination(players:string[]):Rounds{
 const seeds=[...players].sort(()=>Math.random()-.5);let n=1;while(n<seeds.length)n*=2;
 const slots:(string|undefined)[]=[...seeds,...Array(n-seeds.length).fill(undefined)];
 const r1=Array.from({length:n/2},(_,i)=>({a:slots[i*2],b:slots[i*2+1]} as any));
 const rounds:Rounds=[{matches:r1}];
 for(let s=n/4;s>=1;s/=2)rounds.push({matches:Array.from({length:s},()=>({}))});
 r1.forEach((m,i)=>{if(m.a&&!m.b)advance(rounds,0,i,m.a)});return rounds;}
// Round robin: circle method, one round per matchday.
export function roundRobin(players:string[]):Rounds{
 const p:(string|undefined)[]=[...players];if(p.length%2)p.push(undefined);const n=p.length,rounds:Rounds=[];
 for(let r=0;r<n-1;r++){const ms=[];for(let i=0;i<n/2;i++){const a=p[i],b=p[n-1-i];if(a&&b)ms.push({a,b});}
  rounds.push({matches:ms});p.splice(1,0,p.pop());}return rounds;}
export function advance(rounds:Rounds,round:number,index:number,winner:string){
 rounds[round].matches[index].winner=winner;const next=rounds[round+1];if(!next)return;
 const t=next.matches[Math.floor(index/2)];if(index%2===0)t.a=winner;else t.b=winner;
 // auto-advance a bye if the sibling slot is a bye
}
