'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { auth, listings as listingService, storage } from '@/lib/services';
import { supabase } from '@/lib/supabase';
import { toCents, formatPrice, cn } from '@/lib/utils';
import type { Profile, Listing, Category, Amenity, ListingImage } from '@/types/database';

const FALLBACK_CATEGORIES = [
  'Gardens', 'Waterfronts', 'Modern Homes', 'Historic Estates',
  'Courtyards', 'Large Lawns', 'Meadows', 'Terraces',
];

const FALLBACK_AMENITIES = [
  'Parking', 'WiFi', 'Restroom', 'Power Outlets',
  'Water Access', 'Seating', 'Shade', 'Kitchen Access',
  'Changing Area', 'Sound System',
];

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  const [user, setUser] = useState<Profile | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [existingImages, setExistingImages] = useState<ListingImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [maxGuests, setMaxGuests] = useState('');
  const [rules, setRules] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoPreviewUrls, setNewPhotoPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const profile = await auth.getProfile();
        if (!profile) { router.replace('/login'); return; }
        setUser(profile);

        const [cats, ams, listingData, images, existingAmenityIds, existingRules] = await Promise.all([
          listingService.getCategories(),
          listingService.getAmenities(),
          supabase.from('listings').select('*').eq('id', listingId).single().then(r => r.data),
          listingService.getImages(listingId),
          listingService.getListingAmenityIds(listingId),
          listingService.getRules(listingId),
        ]);

        if (!listingData || listingData.host_id !== profile.id) {
          router.replace('/dashboard');
          return;
        }

        setCategories(cats);
        setAmenities(ams);
        setListing(listingData);
        setExistingImages(images);

        // Pre-fill form
        setTitle(listingData.title);
        setDescription(listingData.description);
        setCity(listingData.city);
        setState(listingData.state);
        setZipCode(listingData.zip_code || '');
        setCategoryId(listingData.category_id || '');
        setPricePerHour(String(Math.round(listingData.price_2hr / 200)));
        setMaxGuests(String(listingData.max_guests));
        setSelectedAmenities(existingAmenityIds);
        setRules(existingRules.map((r: any) => r.rule_text).join('\n'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [listingId, router]);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setNewPhotos(prev => [...prev, ...files]);
    const urls = files.map(f => URL.createObjectURL(f));
    setNewPhotoPreviewUrls(prev => [...prev, ...urls]);
  }

  function removeNewPhoto(index: number) {
    URL.revokeObjectURL(newPhotoPreviewUrls[index]);
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
    setNewPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  }

  async function removeExistingImage(imageId: string) {
    try {
      await listingService.deleteImage(imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !listing) return;
    setSubmitting(true);
    setError('');

    try {
      const hourlyPriceCents = toCents(parseFloat(pricePerHour));

      await listingService.update(listing.id, {
        title,
        description,
        city,
        state,
        zip_code: zipCode || null,
        location_label: `${city}, ${state}`,
        category_id: categoryId || null,
        price_2hr: hourlyPriceCents * 2,
        price_halfday: hourlyPriceCents * 4,
        price_fullday: hourlyPriceCents * 8,
        max_guests: parseInt(maxGuests) || 10,
      });

      // Upload new photos
      for (const file of newPhotos) {
        await storage.uploadListingImage(listing.id, file);
      }

      // Update amenities
      await listingService.setAmenities(listing.id, selectedAmenities);

      // Update rules
      const ruleLines = rules.split('\n').map(r => r.trim()).filter(Boolean);
      await listingService.setRules(listing.id, ruleLines);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
      </div>
    );
  }

  const categoryOptions = categories.length > 0
    ? categories
    : FALLBACK_CATEGORIES.map((label, i) => ({ id: label.toLowerCase().replace(/\s+/g, '-'), label, icon: null, description: null, sort_order: i, created_at: '' }));

  const amenityOptions = amenities.length > 0
    ? amenities
    : FALLBACK_AMENITIES.map((label, i) => ({ id: label.toLowerCase().replace(/\s+/g, '-'), label, icon: null }));

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-semibold text-stone-900 mb-1">Edit Listing</h1>
      <p className="text-sm text-stone-500 mb-8">Update your listing details. Changes to an active listing may trigger a re-review.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Section title="Basic Information">
          <Field label="Title" required>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
              className="input-field" />
          </Field>
          <Field label="Description" required>
            <textarea required value={description} onChange={e => setDescription(e.target.value)}
              rows={4} className="input-field resize-none" />
          </Field>
          <Field label="Category">
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input-field">
              <option value="">Select a category</option>
              {categoryOptions.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </Field>
        </Section>

        {/* Location */}
        <Section title="Location">
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" required>
              <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="input-field" />
            </Field>
            <Field label="State" required>
              <input type="text" required value={state} onChange={e => setState(e.target.value)} className="input-field" />
            </Field>
          </div>
          <Field label="ZIP Code">
            <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} className="input-field" />
          </Field>
        </Section>

        {/* Pricing & Capacity */}
        <Section title="Pricing & Capacity">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price per hour ($)" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input type="number" required min="1" step="1" value={pricePerHour}
                  onChange={e => setPricePerHour(e.target.value)}
                  className="input-field pl-7" />
              </div>
            </Field>
            <Field label="Max Guests" required>
              <input type="number" required min="1" value={maxGuests}
                onChange={e => setMaxGuests(e.target.value)}
                className="input-field" />
            </Field>
          </div>
        </Section>

        {/* Photos */}
        <Section title="Photos">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {/* Existing images */}
            {existingImages.map(img => (
              <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200">
                <img src={img.url} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeExistingImage(img.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {/* New photo previews */}
            {newPhotoPreviewUrls.map((url, i) => (
              <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeNewPhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-lg border-2 border-dashed border-stone-200 flex flex-col items-center justify-center cursor-pointer hover:border-stone-400 transition-colors">
              <ImagePlus className="w-6 h-6 text-stone-400 mb-1" />
              <span className="text-xs text-stone-400">Add Photo</span>
              <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" />
            </label>
          </div>
        </Section>

        {/* Amenities */}
        <Section title="Amenities">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {amenityOptions.map(amenity => (
              <label key={amenity.id} className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition-all',
                selectedAmenities.includes(amenity.id)
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 text-stone-600 hover:border-stone-300'
              )}>
                <input type="checkbox"
                  checked={selectedAmenities.includes(amenity.id)}
                  onChange={e => {
                    setSelectedAmenities(prev =>
                      e.target.checked ? [...prev, amenity.id] : prev.filter(id => id !== amenity.id)
                    );
                  }}
                  className="sr-only" />
                {amenity.label}
              </label>
            ))}
          </div>
        </Section>

        {/* House Rules */}
        <Section title="House Rules / Notes for Guests">
          <textarea value={rules} onChange={e => setRules(e.target.value)}
            placeholder="One rule per line"
            rows={4}
            className="input-field resize-none" />
        </Section>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-colors">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/dashboard" className="px-4 py-3 text-sm text-stone-500 hover:text-stone-900 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-stone-100 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-stone-700">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
