export type Listing={id:string;game:string;title:string;price:number;badge?:"New"|"Hot"|"Discount";status:"Approved"|"Reserved"|"Sold";desc:string;listed:string;from:string;to:string};
export const games=[
 {slug:"cod-mobile",name:"COD Mobile",members:12400,live:6,from:"#5B4CFF",to:"#141824"},
 {slug:"efootball",name:"eFootball",members:9800,live:4,from:"#12B886",to:"#141824"},
 {slug:"free-fire",name:"Free Fire",members:15200,live:9,from:"#F5A524",to:"#FF5A5F"},
 {slug:"pubg-mobile",name:"PUBG Mobile",members:7300,live:3,from:"#6B7280",to:"#141824"},
 {slug:"fc-mobile",name:"FC Mobile",members:5100,live:2,from:"#12B886",to:"#5B4CFF"},
 {slug:"clash-royale",name:"Clash Royale",members:4200,live:1,from:"#FF5A5F",to:"#5B4CFF"},
];
export const listings:Listing[]=[
 {id:"CH-1042",game:"eFootball",title:"eFootball account, 4,200 coins",price:45000,badge:"Hot",status:"Approved",desc:"Legendary squad, verified login history.",listed:"2026-09-24",from:"#12B886",to:"#141824"},
 {id:"CH-1043",game:"COD Mobile",title:"Legendary rank, 40 skins",price:80000,badge:"New",status:"Approved",desc:"Mythic weapons, clean account.",listed:"2026-09-28",from:"#5B4CFF",to:"#141824"},
 {id:"CH-1044",game:"Free Fire",title:"Diamond Elite account",price:30000,badge:"Discount",status:"Reserved",desc:"Rare bundles, Grandmaster.",listed:"2026-09-22",from:"#F5A524",to:"#FF5A5F"},
 {id:"CH-1045",game:"PUBG Mobile",title:"Conqueror, rare outfits",price:120000,status:"Approved",desc:"Season-end Conqueror.",listed:"2026-09-20",from:"#6B7280",to:"#141824"},
];
export const naira=(n:number)=>"₦"+n.toLocaleString("en-NG");
