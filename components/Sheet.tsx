"use client";
export default function Sheet({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){
 return(<div className="fixed inset-0 z-50 bg-ink/40 flex items-end md:items-center justify-center" onClick={onClose}>
  <div role="dialog" aria-modal="true" aria-label={title} onClick={e=>e.stopPropagation()} className="bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
   <div className="flex justify-between items-center mb-4"><h2 className="text-xl">{title}</h2><button onClick={onClose} aria-label="Close" className="p-2 -mr-2 text-muted">Close</button></div>{children}</div></div>);
}
