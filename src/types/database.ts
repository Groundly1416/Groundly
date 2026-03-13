// =============================================================
// GROUNDLY — TypeScript Types
// Generated from Supabase schema
//
// In a real project, auto-generate these with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
//
// These types match the database schema exactly.
// =============================================================

// ---- Enums ----

export type UserRole = 'guest' | 'host' | 'admin';
export type ListingStatus = 'draft' | 'under_review' | 'active' | 'paused' | 'rejected';
export type BookingStatus = 'pending' | 'approved' | 'declined' | 'cancelled' | 'completed';
export type BookingDuration = '2hr' | 'halfday' | 'fullday';
export type BookingPurpose =
  | 'engagement' | 'portrait' | 'editorial' | 'brand' | 'family'
  | 'graduation' | 'content' | 'prom' | 'maternity' | 'other';

// ---- Row Types ----

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  role: UserRole;
  is_verified: boolean;
  stripe_customer_id: string | null;
  stripe_account_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Listing {
  id: string;
  host_id: string;
  title: string;
  subtitle: string | null;
  description: string;
  city: string;
  state: string;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  category_id: string | null;
  price_2hr: number;       // in cents
  price_halfday: number;   // in cents
  price_fullday: number;   // in cents
  max_guests: number;
  status: ListingStatus;
  is_featured: boolean;
  is_instant_inquiry: boolean;
  admin_notes: string | null;
  rating_avg: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  storage_path: string | null;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Amenity {
  id: string;
  label: string;
  icon: string | null;
}

export interface ListingRule {
  id: string;
  listing_id: string;
  rule_text: string;
  sort_order: number;
}

export interface ListingAvailability {
  id: string;
  listing_id: string;
  date: string;
  is_available: boolean;
  notes: string | null;
}

export interface BookingRequest {
  id: string;
  listing_id: string;
  guest_id: string;
  host_id: string;
  booking_date: string;
  duration: BookingDuration;
  purpose: BookingPurpose;
  guest_count: number;
  notes: string | null;
  session_price: number;   // in cents
  service_fee: number;     // in cents
  total_price: number;     // in cents
  status: BookingStatus;
  host_response: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
  completed_at: string | null;
}

export interface MessageThread {
  id: string;
  booking_id: string | null;
  listing_id: string;
  guest_id: string;
  host_id: string;
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface Favorite {
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: string;
  location: string | null;
  description: string | null;
  specialty: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  image_url: string | null;
  rating: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  listing_id: string;
  reviewer_id: string;
  rating: number;
  body: string | null;
  is_public: boolean;
  created_at: string;
}

// ---- Composite / View Types ----

export interface ListingDetail extends Listing {
  host: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'bio' | 'is_verified' | 'created_at'>;
  images: ListingImage[];
  amenities: string[];    // amenity labels
  rules: string[];        // rule texts
  tags: string[];
}

export interface ListingSearchResult {
  id: string;
  title: string;
  subtitle: string | null;
  location_label: string | null;
  category_id: string | null;
  price_2hr: number;
  max_guests: number;
  rating_avg: number;
  review_count: number;
  is_featured: boolean;
  is_instant_inquiry: boolean;
  host_name: string | null;
  primary_image_url: string | null;
}

export interface HostStats {
  active_listings: number;
  pending_requests: number;
  total_bookings: number;
  total_earnings: number;    // in cents
  avg_rating: number | null;
}

export interface BookingPriceCalculation {
  session_price: number;   // in cents
  service_fee: number;     // in cents
  total: number;           // in cents
}

// ---- Insert Types ----

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;
export type ListingInsert = Omit<Listing, 'id' | 'rating_avg' | 'review_count' | 'created_at' | 'updated_at' | 'published_at'>;
export type BookingInsert = Omit<BookingRequest, 'id' | 'status' | 'host_response' | 'stripe_payment_intent_id' | 'stripe_charge_id' | 'paid_at' | 'created_at' | 'updated_at' | 'responded_at' | 'completed_at'>;
export type MessageInsert = Pick<Message, 'thread_id' | 'sender_id' | 'body'>;

// ---- Supabase Database interface (for typed client) ----

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: ProfileInsert; Update: Partial<Profile> };
      categories: { Row: Category; Insert: Category; Update: Partial<Category> };
      listings: { Row: Listing; Insert: ListingInsert; Update: Partial<Listing> };
      listing_images: { Row: ListingImage; Insert: Omit<ListingImage, 'id' | 'created_at'>; Update: Partial<ListingImage> };
      amenities: { Row: Amenity; Insert: Amenity; Update: Partial<Amenity> };
      listing_amenities: { Row: { listing_id: string; amenity_id: string }; Insert: { listing_id: string; amenity_id: string }; Update: never };
      listing_rules: { Row: ListingRule; Insert: Omit<ListingRule, 'id'>; Update: Partial<ListingRule> };
      listing_tags: { Row: { listing_id: string; tag: string }; Insert: { listing_id: string; tag: string }; Update: never };
      listing_availability: { Row: ListingAvailability; Insert: Omit<ListingAvailability, 'id'>; Update: Partial<ListingAvailability> };
      booking_requests: { Row: BookingRequest; Insert: BookingInsert; Update: Partial<BookingRequest> };
      message_threads: { Row: MessageThread; Insert: Omit<MessageThread, 'id' | 'last_message_at' | 'created_at'>; Update: Partial<MessageThread> };
      messages: { Row: Message; Insert: MessageInsert; Update: Pick<Message, 'is_read'> };
      favorites: { Row: Favorite; Insert: Pick<Favorite, 'user_id' | 'listing_id'>; Update: never };
      vendors: { Row: Vendor; Insert: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Vendor> };
      reviews: { Row: Review; Insert: Omit<Review, 'id' | 'created_at'>; Update: Partial<Review> };
    };
    Functions: {
      search_listings: {
        Args: {
          search_query?: string;
          filter_category?: string;
          filter_min_price?: number;
          filter_max_price?: number;
          filter_max_guests?: number;
          sort_field?: string;
          result_limit?: number;
          result_offset?: number;
        };
        Returns: ListingSearchResult[];
      };
      get_listing_detail: {
        Args: { listing_uuid: string };
        Returns: { listing: Listing; host: Profile; images: ListingImage[]; amenities: string[]; rules: string[]; tags: string[] };
      };
      get_host_stats: {
        Args: { host_uuid: string };
        Returns: HostStats;
      };
      calculate_booking_price: {
        Args: { p_listing_id: string; p_duration: BookingDuration };
        Returns: BookingPriceCalculation;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}
