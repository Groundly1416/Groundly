-- =============================================================
-- GROUNDLY — Seed Data
-- Migration: 002_seed_data.sql
--
-- Run AFTER 001_initial_schema.sql
-- 
-- NOTE: This seed data uses placeholder UUIDs for host profiles.
-- In production, hosts sign up through auth and profiles are 
-- auto-created. For development, we insert profiles directly.
-- =============================================================

-- -------------------------------------------------------------
-- CATEGORIES
-- -------------------------------------------------------------
INSERT INTO categories (id, label, icon, description, sort_order) VALUES
  ('gardens',     'Gardens',         '🌿', 'Lush private gardens',            1),
  ('waterfronts', 'Waterfronts',     '🌊', 'Waterfront lawns & docks',        2),
  ('modern',      'Modern Homes',    '🏡', 'Contemporary outdoor spaces',     3),
  ('historic',    'Historic Estates', '🏛️', 'Grand estate grounds',           4),
  ('courtyards',  'Courtyards',      '⛲', 'Stone & brick courtyards',        5),
  ('lawns',       'Large Lawns',     '🌳', 'Open expansive lawns',            6),
  ('meadows',     'Meadows',         '🌾', 'Natural meadow settings',         7),
  ('terraces',    'Terraces',        '🏔️', 'Elevated terrace views',          8)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- AMENITIES
-- -------------------------------------------------------------
INSERT INTO amenities (id, label, icon) VALUES
  ('parking',         'Parking',           '🅿️'),
  ('restroom',        'Restroom Access',   '🚻'),
  ('power',           'Power Outlets',     '🔌'),
  ('wifi',            'Wi-Fi',             '📶'),
  ('shade',           'Shade Structures',  '⛱️'),
  ('natural_light',   'Natural Lighting',  '☀️'),
  ('water_features',  'Water Features',    '💧'),
  ('stone_paths',     'Stone Pathways',    '🪨'),
  ('privacy_fence',   'Privacy Fencing',   '🏗️'),
  ('scenic_views',    'Scenic Views',      '🌅'),
  ('garden_seating',  'Garden Seating',    '🪑'),
  ('pergola',         'Pergola',           '🏛️'),
  ('gazebo',          'Gazebo',            '⛺'),
  ('fire_pit',        'Fire Pit Area',     '🔥'),
  ('changing_area',   'Changing Area',     '🚪'),
  ('flat_ground',     'Flat Ground Area',  '⬜'),
  ('pet_friendly',    'Pet Friendly',      '🐾'),
  ('ada_accessible',  'ADA Accessible',    '♿')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- DEV-ONLY PROFILES (bypasses auth for local development)
-- In production, remove this and use real Supabase Auth signups.
-- 
-- To use with real auth, create accounts through the app and
-- update the host_id references in listings below.
-- -------------------------------------------------------------

-- Generate stable UUIDs for dev hosts
DO $$
BEGIN
  -- Only insert if profiles are empty (fresh setup)
  IF NOT EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
    INSERT INTO profiles (id, email, full_name, role, is_verified, bio) VALUES
      ('a0000000-0000-0000-0000-000000000001', 'margaret@example.com', 'Margaret Sterling', 'host', TRUE, 'Lifelong Greenwich resident with a passion for gardens and photography. Our waterfront estate has been in the family for three generations.'),
      ('a0000000-0000-0000-0000-000000000002', 'patricia@example.com', 'Patricia Langley', 'host', TRUE, 'Garden designer and historic property enthusiast. Our Westchester estate features English gardens I''ve cultivated for over twenty years.'),
      ('a0000000-0000-0000-0000-000000000003', 'david@example.com', 'David Kim', 'host', TRUE, 'Architect and design lover. Our Hamptons property was designed to blur the line between architecture and landscape.'),
      ('a0000000-0000-0000-0000-000000000004', 'elena@example.com', 'Elena Rossi', 'host', TRUE, 'European expat who brought a little bit of Provence to the Hudson Valley. Our courtyard properties are labors of love.'),
      ('a0000000-0000-0000-0000-000000000005', 'james@example.com', 'James Whitfield', 'host', TRUE, 'Conservation-minded landowner sharing our meadows and natural landscapes with the creative community.'),
      ('a0000000-0000-0000-0000-000000000006', 'thomas@example.com', 'Thomas Marsh', 'host', TRUE, 'Montauk property owner. The Atlantic coastline is our backyard, and we love sharing its beauty.'),
      ('a0000000-0000-0000-0000-000000000007', 'susan@example.com', 'Susan Blake', 'host', TRUE, 'Family photography advocate. Our birch grove property in Darien has become a beloved spot for family portraits.'),
      ('a0000000-0000-0000-0000-000000000008', 'richard@example.com', 'Richard Harrington', 'host', TRUE, 'Southampton estate owner. Our grounds represent classic Hamptons elegance at its finest.'),
      ('a0000000-0000-0000-0000-000000000009', 'sarah@example.com', 'Sarah Chen', 'guest', FALSE, 'Photographer and creative director based in NYC.'),
      ('a0000000-0000-0000-0000-00000000000a', 'admin@groundly.com', 'Groundly Admin', 'admin', TRUE, 'Platform administrator.');
  END IF;
END $$;

-- -------------------------------------------------------------
-- LISTINGS
-- -------------------------------------------------------------
INSERT INTO listings (id, host_id, title, subtitle, description, city, state, location_label, category_id, price_2hr, price_halfday, price_fullday, max_guests, status, is_featured, is_instant_inquiry, rating_avg, review_count) VALUES

-- 1. Waterfront Estate Lawn
('b0000000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001',
 'Waterfront Estate Lawn',
 'Private waterfront with panoramic Long Island Sound views',
 'A breathtaking two-acre waterfront lawn bordered by mature hedgerows and a private dock. The grounds offer unobstructed views of the Long Island Sound, with golden-hour light that photographers describe as magical. Perfectly manicured grounds with natural stone pathways lead to multiple vignettes ideal for portraits, editorial shoots, and intimate creative sessions.',
 'Greenwich', 'CT', 'Greenwich, CT',
 'waterfronts', 35000, 75000, 120000, 15, 'active', TRUE, FALSE, 4.9, 24),

-- 2. Historic Rose Garden Estate
('b0000000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000002',
 'Historic Rose Garden Estate',
 'English-style gardens on a storied Westchester property',
 'Step into a world of old-world charm on this meticulously maintained Westchester estate. Featuring an English rose garden with over 200 varieties, stone archways draped in wisteria, and a reflecting pool surrounded by boxwood hedging. The property dates to 1920 and exudes timeless elegance at every turn.',
 'Rye', 'NY', 'Rye, NY',
 'gardens', 27500, 60000, 95000, 12, 'active', TRUE, TRUE, 4.8, 18),

-- 3. Modern Glass House Terrace
('b0000000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000003',
 'Modern Glass House Terrace',
 'Sleek contemporary grounds with architectural drama',
 'A striking modern property with clean architectural lines, an infinity-edge lap pool backdrop, and sculptural landscaping. The flat-stone terrace offers a contemporary canvas for fashion editorials, product shoots, and high-end content creation. Surrounded by native grasses and minimalist plantings.',
 'Amagansett', 'NY', 'Amagansett, NY',
 'modern', 42500, 90000, 150000, 10, 'active', TRUE, FALSE, 5.0, 9),

-- 4. Stone Courtyard at Millbrook Manor
('b0000000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000004',
 'Stone Courtyard at Millbrook Manor',
 'European-inspired courtyard with old-world character',
 'A beautifully weathered stone courtyard reminiscent of a Provençal farmhouse. Climbing ivy, antique iron gates, and a central fountain create an atmosphere of European charm. The warm-toned stonework provides stunning backdrops in any season, and the enclosed space ensures complete privacy.',
 'Millbrook', 'NY', 'Millbrook, NY',
 'courtyards', 22500, 50000, 85000, 8, 'active', FALSE, TRUE, 4.7, 31),

-- 5. Meadow Ridge Engagement Grounds
('b0000000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000005',
 'Meadow Ridge Engagement Grounds',
 'Rolling meadows with mountain backdrop perfection',
 'Fifteen acres of wildflower meadows and rolling hills with sweeping views of the Hudson Highlands. This property has become the region''s most sought-after engagement shoot location, offering endless compositions with golden grasses, scattered oak trees, and dramatic seasonal color. Sunsets here are legendary.',
 'Cold Spring', 'NY', 'Cold Spring, NY',
 'meadows', 20000, 42500, 70000, 20, 'active', TRUE, TRUE, 4.9, 42),

-- 6. The Hedge Estate Lawn
('b0000000-0000-0000-0000-000000000006',
 'a0000000-0000-0000-0000-000000000001',
 'The Hedge Estate Lawn',
 'Grand formal grounds with sculpted topiary gardens',
 'A majestic three-acre formal lawn flanked by twelve-foot sculpted hedgerows and a classic allée of linden trees. The grounds feature a sunken garden, a croquet lawn, and a graceful pergola draped in climbing hydrangea. Perfect for editorial content, branding shoots, and graduation portraits.',
 'Bedford', 'NY', 'Bedford, NY',
 'lawns', 30000, 65000, 110000, 25, 'active', FALSE, FALSE, 4.6, 15),

-- 7. Coastal Bluff Overlook
('b0000000-0000-0000-0000-000000000007',
 'a0000000-0000-0000-0000-000000000006',
 'Coastal Bluff Overlook',
 'Dramatic cliffside grounds above the Atlantic',
 'Perched on a private bluff overlooking the Atlantic, this windswept property offers raw, dramatic beauty. Native grasses sway against a backdrop of endless ocean, creating an editorial atmosphere that feels both wild and luxurious. The natural light here shifts dramatically through the day.',
 'Montauk', 'NY', 'Montauk, NY',
 'waterfronts', 47500, 100000, 165000, 8, 'active', TRUE, FALSE, 4.9, 12),

-- 8. Wisteria Terrace & Fountain Garden
('b0000000-0000-0000-0000-000000000008',
 'a0000000-0000-0000-0000-000000000002',
 'Wisteria Terrace & Fountain Garden',
 'Romantic terraced gardens with cascading water features',
 'A three-tiered terraced garden with cascading stone fountains, wisteria-covered arbors, and mature perennial borders. Each level offers a distinct mood — from the intimate upper garden with its iron benches to the expansive lower terrace with its reflecting pool. A photographer''s paradise in every season.',
 'Tarrytown', 'NY', 'Tarrytown, NY',
 'gardens', 25000, 55000, 90000, 10, 'active', FALSE, TRUE, 4.8, 27),

-- 9. Birch Grove Family Estate
('b0000000-0000-0000-0000-000000000009',
 'a0000000-0000-0000-0000-000000000007',
 'Birch Grove Family Estate',
 'Whimsical birch-lined grounds perfect for family portraits',
 'A charming property centered around a stunning grove of white birch trees. The dappled light filtering through the canopy creates naturally soft, flattering illumination. Stone walls, a vintage wooden swing, and a wildflower border add character. Beloved by family portrait photographers.',
 'Darien', 'CT', 'Darien, CT',
 'lawns', 22500, 47500, 80000, 15, 'active', FALSE, TRUE, 4.7, 33),

-- 10. Hampton Manor Grounds
('b0000000-0000-0000-0000-00000000000a',
 'a0000000-0000-0000-0000-000000000008',
 'Hampton Manor Grounds',
 'Classic Hamptons elegance with pristine hedged gardens',
 'The quintessential Hamptons estate experience. Immaculate privet hedges frame a sweeping front lawn, while the rear grounds feature a formal rose garden, a reflection pond, and a classic white pergola. The property''s timeless American grandeur provides a premium backdrop for luxury brand shoots and high-end editorials.',
 'Southampton', 'NY', 'Southampton, NY',
 'historic', 50000, 110000, 180000, 20, 'active', TRUE, FALSE, 5.0, 7),

-- 11. Wildflower Hill
('b0000000-0000-0000-0000-00000000000b',
 'a0000000-0000-0000-0000-000000000005',
 'Wildflower Hill',
 'Naturalistic meadow with panoramic Hudson Valley views',
 'Eight acres of gently sloping meadow blanketed in seasonal wildflowers — black-eyed Susans in summer, goldenrod in autumn, and fresh clover in spring. The property crowns a gentle hill offering 360-degree views of the Hudson Valley. An authentic, unspoiled backdrop for natural-light photography.',
 'Rhinebeck', 'NY', 'Rhinebeck, NY',
 'meadows', 17500, 37500, 62500, 12, 'active', FALSE, TRUE, 4.8, 19),

-- 12. The Ivy Courtyard
('b0000000-0000-0000-0000-00000000000c',
 'a0000000-0000-0000-0000-000000000004',
 'The Ivy Courtyard',
 'Enclosed garden room with European villa atmosphere',
 'A fully enclosed courtyard draped in Boston ivy, featuring hand-laid cobblestone, a central stone fountain, and wrought-iron details. The space feels like a hidden garden in the south of France. Warm afternoon light floods the courtyard, and the ivy transitions beautifully through the seasons.',
 'Bronxville', 'NY', 'Bronxville, NY',
 'courtyards', 30000, 65000, 105000, 6, 'active', FALSE, FALSE, 4.9, 21)

ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- LISTING AMENITIES (join table)
-- -------------------------------------------------------------
-- Waterfront Estate Lawn
INSERT INTO listing_amenities (listing_id, amenity_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'parking'),
  ('b0000000-0000-0000-0000-000000000001', 'restroom'),
  ('b0000000-0000-0000-0000-000000000001', 'power'),
  ('b0000000-0000-0000-0000-000000000001', 'natural_light'),
  ('b0000000-0000-0000-0000-000000000001', 'water_features'),
  ('b0000000-0000-0000-0000-000000000001', 'scenic_views'),
  ('b0000000-0000-0000-0000-000000000001', 'privacy_fence'),
  ('b0000000-0000-0000-0000-000000000001', 'flat_ground')
ON CONFLICT DO NOTHING;

-- Historic Rose Garden
INSERT INTO listing_amenities (listing_id, amenity_id) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'parking'),
  ('b0000000-0000-0000-0000-000000000002', 'restroom'),
  ('b0000000-0000-0000-0000-000000000002', 'power'),
  ('b0000000-0000-0000-0000-000000000002', 'wifi'),
  ('b0000000-0000-0000-0000-000000000002', 'natural_light'),
  ('b0000000-0000-0000-0000-000000000002', 'stone_paths'),
  ('b0000000-0000-0000-0000-000000000002', 'garden_seating'),
  ('b0000000-0000-0000-0000-000000000002', 'pergola'),
  ('b0000000-0000-0000-0000-000000000002', 'changing_area')
ON CONFLICT DO NOTHING;

-- Meadow Ridge
INSERT INTO listing_amenities (listing_id, amenity_id) VALUES
  ('b0000000-0000-0000-0000-000000000005', 'parking'),
  ('b0000000-0000-0000-0000-000000000005', 'natural_light'),
  ('b0000000-0000-0000-0000-000000000005', 'scenic_views'),
  ('b0000000-0000-0000-0000-000000000005', 'flat_ground'),
  ('b0000000-0000-0000-0000-000000000005', 'pet_friendly'),
  ('b0000000-0000-0000-0000-000000000005', 'ada_accessible')
ON CONFLICT DO NOTHING;

-- Hampton Manor
INSERT INTO listing_amenities (listing_id, amenity_id) VALUES
  ('b0000000-0000-0000-0000-00000000000a', 'parking'),
  ('b0000000-0000-0000-0000-00000000000a', 'restroom'),
  ('b0000000-0000-0000-0000-00000000000a', 'power'),
  ('b0000000-0000-0000-0000-00000000000a', 'wifi'),
  ('b0000000-0000-0000-0000-00000000000a', 'shade'),
  ('b0000000-0000-0000-0000-00000000000a', 'natural_light'),
  ('b0000000-0000-0000-0000-00000000000a', 'water_features'),
  ('b0000000-0000-0000-0000-00000000000a', 'stone_paths'),
  ('b0000000-0000-0000-0000-00000000000a', 'garden_seating'),
  ('b0000000-0000-0000-0000-00000000000a', 'pergola'),
  ('b0000000-0000-0000-0000-00000000000a', 'gazebo'),
  ('b0000000-0000-0000-0000-00000000000a', 'flat_ground'),
  ('b0000000-0000-0000-0000-00000000000a', 'changing_area')
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- LISTING RULES
-- -------------------------------------------------------------
INSERT INTO listing_rules (listing_id, rule_text, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'No indoor access', 1),
  ('b0000000-0000-0000-0000-000000000001', 'No amplified music', 2),
  ('b0000000-0000-0000-0000-000000000001', 'No drones without approval', 3),
  ('b0000000-0000-0000-0000-000000000001', 'Must stay in designated areas', 4),
  ('b0000000-0000-0000-0000-000000000001', 'Setup/cleanup within booked time', 5),
  ('b0000000-0000-0000-0000-000000000002', 'No indoor access', 1),
  ('b0000000-0000-0000-0000-000000000002', 'No amplified music', 2),
  ('b0000000-0000-0000-0000-000000000002', 'No alcohol', 3),
  ('b0000000-0000-0000-0000-000000000002', 'No open flames', 4),
  ('b0000000-0000-0000-0000-000000000002', 'No smoking', 5),
  ('b0000000-0000-0000-0000-000000000005', 'Must stay in designated areas', 1),
  ('b0000000-0000-0000-0000-000000000005', 'No open flames', 2),
  ('b0000000-0000-0000-0000-000000000005', 'No drones without approval', 3),
  ('b0000000-0000-0000-0000-000000000005', 'Setup/cleanup within booked time', 4),
  ('b0000000-0000-0000-0000-00000000000a', 'No indoor access', 1),
  ('b0000000-0000-0000-0000-00000000000a', 'No amplified music', 2),
  ('b0000000-0000-0000-0000-00000000000a', 'No alcohol', 3),
  ('b0000000-0000-0000-0000-00000000000a', 'No open flames', 4),
  ('b0000000-0000-0000-0000-00000000000a', 'No smoking', 5),
  ('b0000000-0000-0000-0000-00000000000a', 'No drones without approval', 6),
  ('b0000000-0000-0000-0000-00000000000a', 'Host approval required for all guests', 7);

-- -------------------------------------------------------------
-- LISTING TAGS
-- -------------------------------------------------------------
INSERT INTO listing_tags (listing_id, tag) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Waterfront'),
  ('b0000000-0000-0000-0000-000000000001', 'Golden Hour'),
  ('b0000000-0000-0000-0000-000000000001', 'Engagement Favorite'),
  ('b0000000-0000-0000-0000-000000000002', 'Rose Garden'),
  ('b0000000-0000-0000-0000-000000000002', 'Historic'),
  ('b0000000-0000-0000-0000-000000000002', 'Bridal Favorite'),
  ('b0000000-0000-0000-0000-000000000003', 'Modern'),
  ('b0000000-0000-0000-0000-000000000003', 'Editorial'),
  ('b0000000-0000-0000-0000-000000000003', 'Fashion'),
  ('b0000000-0000-0000-0000-000000000005', 'Meadow'),
  ('b0000000-0000-0000-0000-000000000005', 'Engagement'),
  ('b0000000-0000-0000-0000-000000000005', 'Sunset'),
  ('b0000000-0000-0000-0000-000000000007', 'Ocean'),
  ('b0000000-0000-0000-0000-000000000007', 'Dramatic'),
  ('b0000000-0000-0000-0000-000000000007', 'Editorial'),
  ('b0000000-0000-0000-0000-00000000000a', 'Hamptons'),
  ('b0000000-0000-0000-0000-00000000000a', 'Luxury'),
  ('b0000000-0000-0000-0000-00000000000a', 'Brand Shoots')
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- VENDORS
-- -------------------------------------------------------------
INSERT INTO vendors (name, type, location, description, specialty, rating, is_active, sort_order) VALUES
  ('Luminous Lens Photography',   'Photographer', 'Greenwich, CT',      'Fine art portrait and editorial photography specializing in natural-light outdoor sessions.',          'Engagement & Editorial', 4.9, TRUE, 1),
  ('Wild Bloom Florals',          'Florist',      'Westchester, NY',    'Organic, seasonal floral design using locally sourced blooms. Known for editorial installations.',     'Installations & Bouquets', 4.8, TRUE, 2),
  ('Eventide Planning Co.',       'Planner',      'Hudson Valley, NY',  'Creative shoot coordination, vendor management, and day-of logistics for photo productions.',          'Photo Shoots & Productions', 5.0, TRUE, 3),
  ('Golden Table Catering',       'Catering',     'Hamptons, NY',       'Artisan craft food for styled shoots, editorial lunches, and small creative gatherings.',               'Styled Shoots & Tastings', 4.7, TRUE, 4),
  ('Lux Rentals NY',              'Rentals',      'Rye, NY',            'Curated furniture, prop, and décor rentals for photoshoots. Vintage and modern collections.',           'Vintage & Modern Pieces', 4.8, TRUE, 5),
  ('Frame & Shutter Studios',     'Photographer', 'Tarrytown, NY',      'Commercial and brand photography with a focus on architectural and lifestyle content.',                 'Brand & Product Shoots', 4.9, TRUE, 6)
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------
-- SAMPLE LISTING IMAGES
-- (Replace these URLs with your Supabase Storage URLs after
--  uploading actual photos)
-- -------------------------------------------------------------
INSERT INTO listing_images (listing_id, url, alt_text, sort_order, is_primary) VALUES
  -- Waterfront Estate Lawn
  ('b0000000-0000-0000-0000-000000000001', '/images/placeholder-waterfront-1.jpg', 'Waterfront lawn overview', 0, TRUE),
  ('b0000000-0000-0000-0000-000000000001', '/images/placeholder-waterfront-2.jpg', 'Dock and water view', 1, FALSE),
  ('b0000000-0000-0000-0000-000000000001', '/images/placeholder-waterfront-3.jpg', 'Hedgerow pathway', 2, FALSE),
  -- Historic Rose Garden
  ('b0000000-0000-0000-0000-000000000002', '/images/placeholder-garden-1.jpg', 'Rose garden archway', 0, TRUE),
  ('b0000000-0000-0000-0000-000000000002', '/images/placeholder-garden-2.jpg', 'Reflecting pool', 1, FALSE),
  ('b0000000-0000-0000-0000-000000000002', '/images/placeholder-garden-3.jpg', 'Wisteria arbor', 2, FALSE),
  -- Modern Glass House
  ('b0000000-0000-0000-0000-000000000003', '/images/placeholder-modern-1.jpg', 'Terrace overview', 0, TRUE),
  ('b0000000-0000-0000-0000-000000000003', '/images/placeholder-modern-2.jpg', 'Pool backdrop', 1, FALSE),
  -- Meadow Ridge
  ('b0000000-0000-0000-0000-000000000005', '/images/placeholder-meadow-1.jpg', 'Meadow at golden hour', 0, TRUE),
  ('b0000000-0000-0000-0000-000000000005', '/images/placeholder-meadow-2.jpg', 'Highland views', 1, FALSE),
  -- Hampton Manor
  ('b0000000-0000-0000-0000-00000000000a', '/images/placeholder-hampton-1.jpg', 'Front lawn and hedges', 0, TRUE),
  ('b0000000-0000-0000-0000-00000000000a', '/images/placeholder-hampton-2.jpg', 'Rose garden', 1, FALSE),
  ('b0000000-0000-0000-0000-00000000000a', '/images/placeholder-hampton-3.jpg', 'White pergola', 2, FALSE)
ON CONFLICT DO NOTHING;
