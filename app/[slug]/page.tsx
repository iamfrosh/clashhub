import {notFound} from "next/navigation";import {PAGES} from "@/lib/pages";import ContactForm from "@/components/ContactForm";
export const dynamicParams=false;
export const generateStaticParams=()=>Object.keys(PAGES).map(slug=>({slug}));
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return {title:PAGES[slug]?.title||"ClashHub"};}
export default async function Static({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const p=PAGES[slug];if(!p)notFound();
 return(<article className="mx-auto max-w-2xl px-4 py-10"><h1 className="text-3xl mb-6">{p.title}</h1>{p.body.map(([h,t])=><section key={h} className="mb-6"><h2 className="text-lg mb-1">{h}</h2><p className="text-muted">{t}</p></section>)}{slug==="contact"&&<ContactForm/>}</article>);
}
