-- =============================================================
-- GROUNDLY — Supabase Database Schema
-- Migration: 001_initial_schema.sql
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- or via the Supabase CLI: supabase db push
--
-- This creates all tables, indexes, RLS policies, triggers,
-- functions, and storage buckets for the Groundly MVP.
-- =============================================================

-- -------------------------------------------------------------
-- 0. EXTENSIONS
-- -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------
-- 1. CUSTOM TYPES
-- -------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('guest', 'host', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('draft', 'under_review', 'active', 'paused', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'declined', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_duration AS ENUM ('2hr', 'halfday', 'fullday');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_purpose AS ENUM (
    'engagement', 'portrait', 'editorial', 'brand', 'family',
    'graduation', 'content', 'prom', 'maternity', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -------------------------------------------------------------
-- 2. PROFILES
--    Extends Supabase auth.users with app-specific data.
--    Created automatically via trigger on auth.users insert.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  phone         TEXT,
  bio           TEXT,
  role          user_role NOT NULL DEFAULT 'guest',
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_customer_id    TEXT,  -- Stripe customer for guests
  stripe_account_id     TEXT,  -- Stripe Connect account for hosts
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- -------------------------------------------------------------
-- 3. CATEGORIES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,  -- e.g. 'gardens', 'waterfronts'
  label       TEXT NOT NULL,
  icon        TEXT,              -- emoji or icon name
  description TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------
-- 4. LISTINGS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  subtitle        TEXT,
  description     TEXT NOT NULL,
  
  -- Location
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  zip_code        TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  location_label  TEXT,  -- "Greenwich, CT" for display
  
  -- Category
  category_id     TEXT REFERENCES categories(id),
  
  -- Pricing (in cents for precision, display as dollars)
  price_2hr       INT NOT NULL,      -- price in cents
  price_halfday   INT NOT NULL,
  price_fullday   INT NOT NULL,
  
  -- Capacity
  max_guests      INT NOT NULL DEFAULT 10,
  
  -- Status & Moderation
  status          listing_status NOT NULL DEFAULT 'under_review',
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_instant_inquiry BOOLEAN NOT NULL DEFAULT FALSE,
  admin_notes     TEXT,
  
  -- Metadata
  rating_avg      DECIMAL(2,1) DEFAULT 0,
  review_count    INT DEFAULT 0,
  
  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_listings_host ON listings(host_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(city, state);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price_2hr);

-- Full text search index
ALTER TABLE listings ADD COLUMN IF NOT EXISTS fts tsvector 
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(subtitle, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(city, '')), 'A')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_listings_fts ON listings USING GIN(fts);

-- -------------------------------------------------------------
-- 5. LISTING IMAGES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,           -- Supabase Storage public URL
  storage_path TEXT,                   -- path in Supabase storage bucket
  alt_text    TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_images_listing ON listing_images(listing_id);

-- -------------------------------------------------------------
-- 6. AMENITIES (many-to-many)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS amenities (
  id    TEXT PRIMARY KEY,   -- e.g. 'parking', 'restroom'
  label TEXT NOT NULL,
  icon  TEXT
);

CREATE TABLE IF NOT EXISTS listing_amenities (
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  amenity_id TEXT REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (listing_id, amenity_id)
);

-- -------------------------------------------------------------
-- 7. LISTING RULES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  rule_text   TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_listing_rules_listing ON listing_rules(listing_id);

-- -------------------------------------------------------------
-- 8. LISTING TAGS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing_tags (
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  tag        TEXT NOT NULL,
  PRIMARY KEY (listing_id, tag)
);

-- -------------------------------------------------------------
-- 9. AVAILABILITY
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing_availability (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  notes       TEXT,
  UNIQUE(listing_id, date)
);

CREATE INDEX IF NOT EXISTS idx_availability_listing_date ON listing_availability(listing_id, date);

-- -------------------------------------------------------------
-- 10. BOOKING REQUESTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  guest_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  host_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Booking details
  booking_date    DATE NOT NULL,
  duration        booking_duration NOT NULL,
  purpose         booking_purpose NOT NULL DEFAULT 'other',
  guest_count     INT NOT NULL DEFAULT 1,
  notes           TEXT,
  
  -- Pricing (captured at time of booking in cents)
  session_price   INT NOT NULL,
  service_fee     INT NOT NULL,
  total_price     INT NOT NULL,
  
  -- Status
  status          booking_status NOT NULL DEFAULT 'pending',
  host_response   TEXT,           -- optional message from host on approve/decline
  
  -- Payment
  stripe_payment_intent_id  TEXT,
  stripe_charge_id          TEXT,
  paid_at                   TIMESTAMPTZ,
  
  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at    TIMESTAMPTZ,     -- when host approved/declined
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bookings_listing ON booking_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON booking_requests(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_host ON booking_requests(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON booking_requests(booking_date);

-- -------------------------------------------------------------
-- 11. MESSAGES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_threads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
  listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  guest_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  host_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_threads_guest ON message_threads(guest_id);
CREATE INDEX IF NOT EXISTS idx_threads_host ON message_threads(host_id);

CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id   UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id, created_at);

-- -------------------------------------------------------------
-- 12. FAVORITES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id  UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- -------------------------------------------------------------
-- 13. VENDORS (curated, admin-managed)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendors (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,     -- 'Photographer', 'Florist', etc.
  location    TEXT,
  description TEXT,
  specialty   TEXT,
  website     TEXT,
  email       TEXT,
  phone       TEXT,
  instagram   TEXT,
  image_url   TEXT,
  rating      DECIMAL(2,1),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------
-- 14. REVIEWS (placeholder for future)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body        TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id);

-- =============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------- PROFILES ----------
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE USING (is_admin());

-- ---------- CATEGORIES / AMENITIES (public read) ----------
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Admin can manage categories"
  ON categories FOR ALL USING (is_admin());

CREATE POLICY "Anyone can read amenities"
  ON amenities FOR SELECT USING (true);

CREATE POLICY "Admin can manage amenities"
  ON amenities FOR ALL USING (is_admin());

-- ---------- LISTINGS ----------
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT USING (
    status = 'active' 
    OR host_id = auth.uid() 
    OR is_admin()
  );

CREATE POLICY "Hosts can create listings"
  ON listings FOR INSERT WITH CHECK (
    auth.uid() = host_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('host', 'admin'))
  );

CREATE POLICY "Hosts can update own listings"
  ON listings FOR UPDATE USING (
    host_id = auth.uid() OR is_admin()
  );

CREATE POLICY "Admin can delete listings"
  ON listings FOR DELETE USING (is_admin());

-- ---------- LISTING IMAGES ----------
CREATE POLICY "Anyone can view listing images"
  ON listing_images FOR SELECT USING (true);

CREATE POLICY "Hosts can manage own listing images"
  ON listing_images FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND host_id = auth.uid())
  );

CREATE POLICY "Hosts can update own listing images"
  ON listing_images FOR UPDATE USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND host_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Hosts can delete own listing images"
  ON listing_images FOR DELETE USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND host_id = auth.uid())
    OR is_admin()
  );

-- ---------- LISTING AMENITIES / RULES / TAGS ----------
CREATE POLICY "Anyone can read listing amenities"
  ON listing_amenities FOR SELECT USING (true);

CREATE POLICY "Hosts can manage listing amenities"
  ON listing_amenities FOR ALL USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND host_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Anyone can read listing rules"
  ON listing_rules FOR SELECT USING (true);

CREATE POLICY "Hosts can manage listing rules"
  ON listing_rules FOR ALL USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND host_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Anyone can read listing tags"
  ON listing_tags FOR SELECT USING (true);

CREATE POLICY "Hosts can manage listing tags"
  ON listing_tags FOR ALL USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND host_id = auth.uid())
    OR is_admin()
  );

-- ---------- AVAILABILITY ----------
CREATE POLICY "Anyone can view availability"
  ON listing_availability FOR SELECT USING (true);

CREATE POLICY "Hosts can manage availability"
  ON listing_availability FOR ALL USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND host_id = auth.uid())
    OR is_admin()
  );

-- ---------- BOOKING REQUESTS ----------
CREATE POLICY "Guests can view own bookings"
  ON booking_requests FOR SELECT USING (
    guest_id = auth.uid() OR host_id = auth.uid() OR is_admin()
  );

CREATE POLICY "Guests can create bookings"
  ON booking_requests FOR INSERT WITH CHECK (
    auth.uid() = guest_id
  );

CREATE POLICY "Hosts can update booking status"
  ON booking_requests FOR UPDATE USING (
    host_id = auth.uid() OR guest_id = auth.uid() OR is_admin()
  );

-- ---------- MESSAGES ----------
CREATE POLICY "Participants can view threads"
  ON message_threads FOR SELECT USING (
    guest_id = auth.uid() OR host_id = auth.uid() OR is_admin()
  );

CREATE POLICY "Authenticated users can create threads"
  ON message_threads FOR INSERT WITH CHECK (
    auth.uid() = guest_id OR auth.uid() = host_id
  );

CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM message_threads 
      WHERE id = thread_id 
      AND (guest_id = auth.uid() OR host_id = auth.uid())
    )
    OR is_admin()
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM message_threads 
      WHERE id = thread_id 
      AND (guest_id = auth.uid() OR host_id = auth.uid())
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM message_threads 
      WHERE id = thread_id 
      AND (guest_id = auth.uid() OR host_id = auth.uid())
    )
  );

-- ---------- FAVORITES ----------
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE USING (user_id = auth.uid());

-- ---------- VENDORS (public read, admin manage) ----------
CREATE POLICY "Anyone can view active vendors"
  ON vendors FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admin can manage vendors"
  ON vendors FOR ALL USING (is_admin());

-- ---------- REVIEWS ----------
CREATE POLICY "Anyone can view public reviews"
  ON reviews FOR SELECT USING (is_public = TRUE OR reviewer_id = auth.uid() OR is_admin());

CREATE POLICY "Guests can create reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- =============================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'guest')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_listings_updated_at
  BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON booking_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_vendors_updated_at
  BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update listing rating when review is added
CREATE OR REPLACE FUNCTION update_listing_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings SET
    rating_avg = (SELECT AVG(rating) FROM reviews WHERE listing_id = NEW.listing_id AND is_public = TRUE),
    review_count = (SELECT COUNT(*) FROM reviews WHERE listing_id = NEW.listing_id AND is_public = TRUE)
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_listing_rating();

-- Update thread last_message_at when new message
CREATE OR REPLACE FUNCTION update_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_threads SET last_message_at = now() WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_thread_timestamp();

-- Mark listing as published when status changes to active
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_listing_published
  BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION set_published_at();

-- =============================================================
-- DATABASE FUNCTIONS (callable from client via supabase.rpc())
-- =============================================================

-- Search listings with full-text search
CREATE OR REPLACE FUNCTION search_listings(
  search_query TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL,
  filter_min_price INT DEFAULT NULL,
  filter_max_price INT DEFAULT NULL,
  filter_max_guests INT DEFAULT NULL,
  sort_field TEXT DEFAULT 'featured',
  result_limit INT DEFAULT 20,
  result_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID, title TEXT, subtitle TEXT, location_label TEXT,
  category_id TEXT, price_2hr INT, max_guests INT,
  rating_avg DECIMAL, review_count INT, is_featured BOOLEAN,
  is_instant_inquiry BOOLEAN, host_name TEXT,
  primary_image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id, l.title, l.subtitle, l.location_label,
    l.category_id, l.price_2hr, l.max_guests,
    l.rating_avg, l.review_count, l.is_featured,
    l.is_instant_inquiry,
    p.full_name AS host_name,
    (SELECT li.url FROM listing_images li WHERE li.listing_id = l.id AND li.is_primary = TRUE LIMIT 1) AS primary_image_url
  FROM listings l
  JOIN profiles p ON l.host_id = p.id
  WHERE l.status = 'active'
    AND (search_query IS NULL OR l.fts @@ plainto_tsquery('english', search_query))
    AND (filter_category IS NULL OR l.category_id = filter_category)
    AND (filter_min_price IS NULL OR l.price_2hr >= filter_min_price)
    AND (filter_max_price IS NULL OR l.price_2hr <= filter_max_price)
    AND (filter_max_guests IS NULL OR l.max_guests >= filter_max_guests)
  ORDER BY
    CASE WHEN sort_field = 'featured' THEN l.is_featured END DESC NULLS LAST,
    CASE WHEN sort_field = 'price_low' THEN l.price_2hr END ASC,
    CASE WHEN sort_field = 'price_high' THEN l.price_2hr END DESC,
    CASE WHEN sort_field = 'rating' THEN l.rating_avg END DESC,
    l.created_at DESC
  LIMIT result_limit OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get full listing detail with all relations
CREATE OR REPLACE FUNCTION get_listing_detail(listing_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'listing', row_to_json(l),
    'host', json_build_object(
      'id', p.id, 'full_name', p.full_name, 'avatar_url', p.avatar_url,
      'bio', p.bio, 'is_verified', p.is_verified, 'created_at', p.created_at
    ),
    'images', (SELECT json_agg(row_to_json(li) ORDER BY li.sort_order) FROM listing_images li WHERE li.listing_id = l.id),
    'amenities', (SELECT json_agg(a.label) FROM listing_amenities la JOIN amenities a ON a.id = la.amenity_id WHERE la.listing_id = l.id),
    'rules', (SELECT json_agg(lr.rule_text ORDER BY lr.sort_order) FROM listing_rules lr WHERE lr.listing_id = l.id),
    'tags', (SELECT json_agg(lt.tag) FROM listing_tags lt WHERE lt.listing_id = l.id)
  ) INTO result
  FROM listings l
  JOIN profiles p ON l.host_id = p.id
  WHERE l.id = listing_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get host dashboard stats
CREATE OR REPLACE FUNCTION get_host_stats(host_uuid UUID)
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'active_listings', (SELECT COUNT(*) FROM listings WHERE host_id = host_uuid AND status = 'active'),
    'pending_requests', (SELECT COUNT(*) FROM booking_requests WHERE host_id = host_uuid AND status = 'pending'),
    'total_bookings', (SELECT COUNT(*) FROM booking_requests WHERE host_id = host_uuid AND status IN ('approved', 'completed')),
    'total_earnings', (SELECT COALESCE(SUM(session_price), 0) FROM booking_requests WHERE host_id = host_uuid AND status IN ('approved', 'completed')),
    'avg_rating', (SELECT AVG(l.rating_avg) FROM listings l WHERE l.host_id = host_uuid AND l.rating_avg > 0)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Calculate booking price
CREATE OR REPLACE FUNCTION calculate_booking_price(
  p_listing_id UUID,
  p_duration booking_duration
)
RETURNS JSON AS $$
DECLARE
  session_price INT;
  service_fee INT;
BEGIN
  SELECT 
    CASE p_duration
      WHEN '2hr' THEN l.price_2hr
      WHEN 'halfday' THEN l.price_halfday
      WHEN 'fullday' THEN l.price_fullday
    END INTO session_price
  FROM listings l WHERE l.id = p_listing_id;
  
  service_fee := ROUND(session_price * 0.12);
  
  RETURN json_build_object(
    'session_price', session_price,
    'service_fee', service_fee,
    'total', session_price + service_fee
  );
END;
$$ LANGUAGE plpgsql STABLE;
