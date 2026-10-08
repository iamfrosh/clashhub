// ClashHub loader: two blades clash, a spark flashes, a ring spins. Pure SVG + CSS, static for reduced motion.
export default function Loader({label="Loading",size=88,brand=false,inline=false}:{label?:string;size?:number;brand?:boolean;inline?:boolean}){
 return(<div role="status" aria-live="polite" className={`clash-loader flex flex-col items-center gap-3 ${inline?"":"py-10 justify-center"}`}>
  <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
   <circle cx="60" cy="60" r="50" fill="none" stroke="#E8EAF0" strokeWidth="5"/>
   <circle className="cl-arc" cx="60" cy="60" r="50" fill="none" stroke="#5B4CFF" strokeWidth="5" strokeLinecap="round" strokeDasharray="60 260"/>
   <rect className="cl-a" x="34" y="56" width="52" height="8" rx="4" fill="#141824"/>
   <rect className="cl-b" x="34" y="56" width="52" height="8" rx="4" fill="#5B4CFF"/>
   <circle className="cl-spark" cx="60" cy="60" r="11" fill="#FF5A5F"/>
  </svg>
  {brand&&<p className="font-display font-bold text-2xl tracking-tight cl-word">Clash<span className="text-primary">Hub</span></p>}
  <span className="sr-only">{label}</span></div>);
}
