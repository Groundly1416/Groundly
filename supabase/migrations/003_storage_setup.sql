-- =============================================================
-- GROUNDLY — Storage Bucket Setup
-- Migration: 003_storage_setup.sql
--
-- Creates Supabase Storage buckets and RLS policies for
-- listing images, avatars, and vendor images.
-- =============================================================

-- -------------------------------------------------------------
-- 1. CREATE BUCKETS
-- Run these via Supabase Dashboard → Storage → New bucket
-- OR use the SQL below (requires service_role access)
-- -------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('listing-images', 'listing-images', TRUE, 10485760, -- 10MB
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('avatars', 'avatars', TRUE, 5242880, -- 5MB
   ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('vendor-images', 'vendor-images', TRUE, 5242880,
   ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- 2. STORAGE POLICIES
-- -------------------------------------------------------------

-- LISTING IMAGES BUCKET --

-- Anyone can view listing images (public bucket)
CREATE POLICY "Public listing image access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

-- Hosts can upload images to their own folder
-- Folder structure: listing-images/{listing_id}/{filename}
CREATE POLICY "Hosts can upload listing images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listing-images'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM listings 
      WHERE id = (storage.foldername(name))[1]::UUID
      AND host_id = auth.uid()
    )
  );

-- Hosts can update their own listing images
CREATE POLICY "Hosts can update listing images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listing-images'
    AND EXISTS (
      SELECT 1 FROM listings 
      WHERE id = (storage.foldername(name))[1]::UUID
      AND host_id = auth.uid()
    )
  );

-- Hosts can delete their own listing images
CREATE POLICY "Hosts can delete listing images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listing-images'
    AND EXISTS (
      SELECT 1 FROM listings 
      WHERE id = (storage.foldername(name))[1]::UUID
      AND host_id = auth.uid()
    )
  );

-- Admin can manage all listing images
CREATE POLICY "Admin can manage all listing images"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'listing-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- AVATARS BUCKET --

-- Anyone can view avatars
CREATE POLICY "Public avatar access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload their own avatar
-- Folder structure: avatars/{user_id}/{filename}
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- VENDOR IMAGES BUCKET --

-- Anyone can view vendor images
CREATE POLICY "Public vendor image access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-images');

-- Only admins can manage vendor images
CREATE POLICY "Admin can manage vendor images"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'vendor-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
