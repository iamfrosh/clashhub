export default function AuthLayout({children}:{children:React.ReactNode}){
 return(<div className="bg-soft min-h-[calc(100vh-4rem)] flex items-center justify-center p-4"><div className="w-full max-w-4xl grid lg:grid-cols-2 card overflow-hidden">
  <div className="p-6 sm:p-10">{children}</div>
  <div className="hidden lg:flex items-end p-10 text-white" style={{background:"linear-gradient(160deg,#5B4CFF,#141824)"}}><p className="font-display text-3xl font-semibold">Play. Compete. Trade with trust.</p></div>
 </div></div>);
}
