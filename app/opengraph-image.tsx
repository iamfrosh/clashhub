import {ImageResponse} from "next/og";
export const size={width:1200,height:630};export const contentType="image/png";export const alt="ClashHub";
export default function Image(){return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",padding:80,background:"linear-gradient(135deg,#5B4CFF,#141824)",color:"#fff"}}><div style={{fontSize:96,fontWeight:700}}>ClashHub</div><div style={{fontSize:40,marginTop:16}}>Play. Compete. Trade with trust.</div></div>,size);}
