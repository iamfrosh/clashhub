import type {NextApiRequest,NextApiResponse} from "next";import {getApp} from "../../server/bootstrap";
export const config={maxDuration:30,api:{bodyParser:false,externalResolver:true}};
// Public, anonymous GETs are cached at the edge for speed.
const CACHEABLE=/^\/api\/(listings|communities(\/[a-z0-9-]+)?|leaderboards|public\/config|tournaments)(\?[^/]*)?$/;
export default async function handler(req:NextApiRequest,res:NextApiResponse){
 if(req.method==="GET"&&!req.headers.authorization&&CACHEABLE.test(req.url||""))res.setHeader("Cache-Control","public, s-maxage=30, stale-while-revalidate=120");
 try{const app=await getApp();(app.getHttpAdapter().getInstance() as any)(req,res);}
 catch(e){console.error(e);res.status(503).json({message:"Service unavailable. Please try again."});}
}
