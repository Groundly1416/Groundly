# 🌿 Groundly

**Book private outdoor spaces for photo and creative shoots.**

A premium marketplace connecting photographers, content creators, and creative professionals with beautiful private estates, gardens, and outdoor spaces.

---

## 🚀 How to Get This Running

### Prerequisites

You need these installed on your computer:
- **Node.js** (v18 or newer) — [download here](https://nodejs.org/)
- A **Supabase** account (free) — [sign up here](https://supabase.com/)

That's it. Everything else is included.

---

### Step 1: Download and Install

```bash
# Navigate into the project folder
cd groundly

# Install all dependencies
npm install
```

This installs Next.js, React, Tailwind, Supabase client, and everything else.

---

### Step 2: Set Up Supabase (your database)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Name it `groundly`, pick a password, choose US East region
4. Wait ~2 minutes for it to provision

Now run the database setup:

5. In your Supabase dashboard, click **SQL Editor** (left sidebar)
6. Open the file `supabase/migrations/001_initial_schema.sql`
7. Copy ALL the contents, paste into the SQL Editor, click **Run**
8. Repeat for `002_seed_data.sql` (sample listings and vendors)
9. Repeat for `003_storage_setup.sql` (image upload buckets)

Each one should show "Success". You now have a full database with 12 sample listings, vendors, and all the tables.

---

### Step 3: Connect Your App to Supabase

1. In your Supabase dashboard, go to **Settings → API**
2. Copy the **Project URL** and **anon/public key**
3. Open the `.env.local` file in the project root
4. Replace the placeholder values:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...your-real-key
```

---

### Step 4: Run It

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**You should see the full Groundly homepage with hero image, categories, featured listings (pulled from your Supabase database), and all navigation working.**

---

### Step 5: Try It Out

- **Browse** → `/browse` — search and filter all 12 seed listings
- **Click a listing** → full detail page with images, amenities, pricing, booking form
- **Sign up** → `/signup` — creates a real account in Supabase Auth
- **Sign in** → `/login` — authenticates against Supabase
- **Vendors** → `/vendors` — curated vendor directory
- **Host landing** → `/host` — host onboarding pitch page
- **About / FAQ / Trust** → static informational pages

---

## 📁 Project Structure

```
groundly/
├── src/
│   ├── app/                    ← Next.js App Router pages
│   │   ├── page.tsx            ← Homepage
│   │   ├── browse/page.tsx     ← Search & browse listings
│   │   ├── listing/[id]/page.tsx ← Individual listing detail
│   │   ├── login/page.tsx      ← Sign in
│   │   ├── signup/page.tsx     ← Create account
│   │   ├── host/page.tsx       ← Host landing/CTA
│   │   ├── vendors/page.tsx    ← Vendor directory
│   │   ├── about/page.tsx      ← About Groundly
│   │   ├── faq/page.tsx        ← FAQ accordion
│   │   └── trust/page.tsx      ← Trust & Safety
│   ├── components/
│   │   ├── layout/             ← Navbar, Footer, HeroSearch
│   │   └── listings/           ← PropertyCard
│   ├── lib/
│   │   ├── supabase.ts         ← Supabase client initialization
│   │   ├── services.ts         ← All database queries (auth, listings, bookings, etc.)
│   │   └── utils.ts            ← cn(), formatPrice(), etc.
│   ├── hooks/
│   │   └── useSupabase.ts      ← React hooks for every feature
│   └── types/
│       └── database.ts         ← Full TypeScript types
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql  ← Tables, RLS, triggers, functions
│       ├── 002_seed_data.sql       ← 12 listings, vendors, categories
│       └── 003_storage_setup.sql   ← Image upload buckets
├── .env.local                  ← Your Supabase keys go here
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## 🗄️ What the Database Gives You

After running the 3 SQL files, your Supabase project has:

**14 tables** with full Row Level Security:
- `profiles` — users (auto-created on signup via trigger)
- `listings` — properties with pricing, location, full-text search
- `listing_images` — photos per listing
- `categories` — Gardens, Waterfronts, Modern, etc.
- `amenities` + `listing_amenities` — what each property offers
- `listing_rules` — property-specific rules
- `listing_tags` — searchable tags
- `listing_availability` — blocked dates
- `booking_requests` — full booking workflow with status tracking
- `message_threads` + `messages` — guest↔host messaging (realtime-ready)
- `favorites` — saved listings
- `vendors` — curated vendor directory
- `reviews` — rating system (ready for future use)

**4 database functions** (callable from the app):
- `search_listings()` — full-text search with filters
- `get_listing_detail()` — returns listing + host + images + amenities + rules
- `get_host_stats()` — dashboard stats for hosts
- `calculate_booking_price()` — computes session price + 12% fee

**Seed data**: 12 realistic premium listings, 8 host profiles, 6 curated vendors, 8 categories, 18 amenities

---

## 🚢 Deploy to Production

When you're ready to go live:

```bash
# Deploy to Vercel (free)
npx vercel

# It will ask you to set environment variables:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Or deploy to any platform that supports Next.js (Netlify, Railway, etc.)

---

## 🔮 What to Build Next

This MVP gives you a launchable foundation. Natural next steps:

1. **Stripe integration** — capture deposits after host approval (DB columns are ready)
2. **Image uploads** — host uploads photos to Supabase Storage (service function is ready)
3. **Host dashboard** — manage listings, approve/decline bookings (hooks are ready)
4. **Real-time messaging** — the `subscribeToThread()` function enables live chat
5. **Map view** — add Mapbox with the lat/lng columns on listings
6. **Reviews** — the reviews table is ready, just needs UI
7. **Email notifications** — add Resend or SendGrid for booking alerts

---

## 💡 Tips

- **No listings showing up?** Make sure you ran all 3 SQL files in order in Supabase SQL Editor
- **Auth not working?** Check that your `.env.local` has the correct Supabase URL and anon key
- **Images not loading?** The seed data uses Unsplash URLs — make sure you have internet access
- **Want to add your own listings?** Use the Supabase dashboard Table Editor to add rows to the `listings` table, or build out the create-listing page

---

Built with Next.js, React, Tailwind CSS, and Supabase.
