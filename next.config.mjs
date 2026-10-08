const dev=process.env.NODE_ENV==="development";const ga=!!process.env.NEXT_PUBLIC_GA_ID;
const csp=[
 "default-src 'self'",
 `script-src 'self' 'unsafe-inline'${dev?" 'unsafe-eval'":""} https://challenges.cloudflare.com${ga?" https://www.googletagmanager.com":""}`,
 "style-src 'self' 'unsafe-inline'","img-src 'self' data: blob: https:","font-src 'self' data:",
 `connect-src 'self' https://*.amazonaws.com https://challenges.cloudflare.com${ga?" https://*.google-analytics.com https://*.googletagmanager.com":""}`,
 "frame-src https://challenges.cloudflare.com","frame-ancestors 'none'","base-uri 'self'","form-action 'self'","object-src 'none'",
 ...(dev?[]:["upgrade-insecure-requests"]),
].join("; ");
export default {
 poweredByHeader:false,reactStrictMode:true,
 // Keep Nest/Mongoose out of the bundle and keep class names (they are used as DI tokens).
 serverExternalPackages:["@nestjs/common","@nestjs/core","@nestjs/platform-express","@nestjs/mongoose","@nestjs/jwt","@nestjs/config","@nestjs/throttler","mongoose","class-validator","class-transformer","reflect-metadata","helmet","cookie-parser","resend","@node-rs/argon2"],
 experimental:{serverMinification:false,optimizePackageImports:["lucide-react"]},
 async headers(){return [{source:"/(.*)",headers:[
  {key:"Content-Security-Policy",value:csp},{key:"X-Frame-Options",value:"DENY"},{key:"X-Content-Type-Options",value:"nosniff"},
  {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},{key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
  {key:"Strict-Transport-Security",value:"max-age=63072000; includeSubDomains; preload"}]}];},
};
