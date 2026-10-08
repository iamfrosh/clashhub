import "./globals.css";
import {Sora,Inter} from "next/font/google";
import Navbar from "@/components/Navbar";import Footer from "@/components/Footer";import BottomTabs from "@/components/BottomTabs";import AuthProvider from "@/components/AuthProvider";import SiteGate from "@/components/SiteGate";
const sora=Sora({subsets:["latin"],variable:"--font-sora",weight:["600","700"]});
const inter=Inter({subsets:["latin"],variable:"--font-inter",weight:["400","500"]});
const SITE=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";
export const metadata={metadataBase:new URL(SITE),title:{default:"ClashHub | Play, compete, buy and sell",template:"%s | ClashHub"},description:"Game communities, refereed matches and a verified game-account marketplace.",
 openGraph:{siteName:"ClashHub",type:"website",locale:"en_NG"},twitter:{card:"summary_large_image" as const}};
export const viewport={themeColor:"#5B4CFF",width:"device-width",initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){
 return(<html lang="en" suppressHydrationWarning className={`${sora.variable} ${inter.variable}`}><head><script dangerouslySetInnerHTML={{__html:"try{if(sessionStorage.getItem('splash'))document.documentElement.classList.add('no-splash')}catch(e){}"}}/></head><body><a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-full focus:shadow-card">Skip to content</a><AuthProvider><Navbar/><SiteGate><main id="main">{children}</main></SiteGate><Footer/><BottomTabs/></AuthProvider></body></html>);
}
