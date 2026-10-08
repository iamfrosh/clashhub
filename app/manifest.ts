import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest{return {name:"ClashHub",short_name:"ClashHub",description:"Game communities, refereed matches and a verified game-account marketplace.",start_url:"/",display:"standalone",background_color:"#FFFFFF",theme_color:"#5B4CFF",icons:[{src:"/icon.svg",sizes:"any",type:"image/svg+xml"}]};}
