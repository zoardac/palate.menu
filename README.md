# ✦Palate

> Where food meets music. — [palate.menu](https://palate.menu)

## Stack

- [Astro](https://astro.build) — static site framework
- [Vercel](https://vercel.com) — hosting + serverless functions
- Vercel KV — email waitlist storage

## Project Structure

```
palate/
├── src/
│   ├── layouts/
│   │   └── Base.astro          # HTML shell, fonts, meta
│   ├── components/
│   │   └── WaitlistForm.astro  # Email capture form
│   └── pages/
│       ├── index.astro         # Main one-pager
│       └── api/
│           └── waitlist.ts     # Serverless email handler
├── astro.config.mjs
├── vercel.json
└── package.json
```

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321)

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create palate --private --push
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Framework preset will auto-detect as **Astro**
4. Click **Deploy**

### 3. Connect your domain

1. In Vercel dashboard → your project → **Settings → Domains**
2. Add `palate.menu`
3. At your registrar (Namecheap/Cloudflare), add the DNS records Vercel gives you:
   - `A` record → `76.76.21.21`
   - `CNAME` `www` → `cname.vercel-dns.com`

### 4. Set up email storage (Vercel KV)

1. In Vercel dashboard → your project → **Storage → Create KV Store**
2. Name it `palate-waitlist`, click **Create**
3. In **Settings → Environment Variables**, you'll see `KV_REST_API_URL` and `KV_REST_API_TOKEN` auto-populated
4. Redeploy — email signups now persist in KV

### 5. View signups

In Vercel dashboard → Storage → your KV store → **CLI** tab:

```bash
# See all signups
vercel kv lrange waitlist:all 0 -1

# Count signups
vercel kv llen waitlist:all
```

Or install the Vercel CLI:
```bash
npm i -g vercel
vercel login
vercel kv lrange waitlist:all 0 -1
```

## Without KV (fallback)

If KV isn't set up, signups are logged to Vercel's function logs:
- Vercel dashboard → your project → **Functions** tab → click the `api/waitlist` function → **Logs**
