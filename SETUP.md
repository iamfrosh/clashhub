# ClashHub (single Next.js project)

Frontend and API live in one project. The API runs inside Next.js at `/api/*`, so you host one thing on Vercel.

## Run locally
    npm install
    cp .env.example .env.local     # fill in values (Windows: copy .env.example .env.local)
    npm run seed                   # creates the admin + 3 starter communities
    npm run dev                    # http://localhost:3000
Admin login after seeding: ADMIN_EMAIL (or username `clashhub_admin`) + ADMIN_PASSWORD.

## Services you need (all have free tiers)
1. MongoDB Atlas: create a cluster, a database user, and under Network Access allow 0.0.0.0/0 (Vercel has no fixed IP). Put the connection string in MONGO_URI.
2. Cloudflare Turnstile: get a site key + secret. Add your domain to its allowed hostnames.
3. Resend: verify your sending domain, create an API key.
4. AWS S3: private bucket for uploads, CDN/public URL in CDN_URL, CORS rule allowing PUT from your site, and an IAM key (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) with PutObject on the bucket.

## Deploy: GitHub then Vercel
1. Push to GitHub (private repo). `.gitignore` already keeps secrets out.
2. vercel.com > Add New > Project > import the repo. Leave Root Directory empty (the project is at the repo root). Framework: Next.js.
3. Add every variable from `.env.example` under Environment Variables. Set CLIENT_URL and NEXT_PUBLIC_SITE_URL to your live URL (https://your-app.vercel.app, no trailing slash).
4. Deploy. Then run `npm run seed` ONCE from your computer with MONGO_URI pointing at Atlas (put it in .env.local), so the admin exists.
5. Test: /api/health should return {"ok":true}.

## Speed
- Same origin: no CORS preflights, no separate server to wake up.
- Public pages data (listings, communities, leaderboards, tournaments) is cached at the edge for 30s.
- Chat/notification polling pauses when the tab is hidden.
- Put Vercel's function region next to your Atlas region (Vercel > Settings > Functions > Region). Default is Washington (iad1): pick Atlas AWS us-east-1, or move both to Europe (fra1 + eu-central-1).

## Scheduled jobs (important)
`/api/cron/tick` expires referee requests, sends the 5-minute "unread message" emails and finishes large email sends.
Vercel Hobby only runs crons once a day (configured in vercel.json). For every-minute runs, create a free job at cron-job.org calling
`https://YOUR-SITE/api/cron/tick?key=YOUR_CRON_SECRET` every minute.

## What changed from the two-app version
- Live chat now uses fast polling (3s) because Vercel cannot hold WebSocket connections. Typing and online indicators were dropped.
- Emails send directly through Resend; bulk sends go in batches of 100 and anything left is finished by the cron tick.
- Rate limits are per server instance (serverless), so Turnstile and the account lockout do most of the bot defence.

## Still to do / review
- Double elimination and groups + knockout tournaments, video evidence, avatar crop, per-event notification toggles.
- Admin Content editor, moderator management UI, tournament and referee admin views.
- Terms, Privacy and Cookie Policy are drafts; have a lawyer review. Replace security.txt contact in public/.well-known.
- Add error monitoring (e.g. Sentry) and an uptime check on /api/health.
