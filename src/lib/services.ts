// =============================================================
// GROUNDLY — Data Services
// All Supabase queries in one place.
// Import and use from any component or server action.
// =============================================================

import { supabase } from './supabase';
import type {
  Profile, Listing, ListingSearchResult, BookingRequest,
  BookingDuration, BookingStatus, MessageThread, Message,
  Vendor, HostStats, BookingPriceCalculation, UserRole,
} from '@/types/database';

// ---- AUTH ----

export const auth = {
  async signUp(email: string, password: string, fullName: string, role: UserRole = 'guest') {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return data;
  },

  async updateProfile(updates: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single();
    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ---- LISTINGS ----

export const listings = {
  async search(params: {
    query?: string; category?: string; minPrice?: number;
    maxPrice?: number; maxGuests?: number; sort?: string;
    limit?: number; offset?: number;
  }): Promise<ListingSearchResult[]> {
    const { data, error } = await supabase.rpc('search_listings', {
      search_query: params.query || null,
      filter_category: params.category || null,
      filter_min_price: params.minPrice ? params.minPrice * 100 : null,
      filter_max_price: params.maxPrice ? params.maxPrice * 100 : null,
      filter_max_guests: params.maxGuests || null,
      sort_field: params.sort || 'featured',
      result_limit: params.limit || 20,
      result_offset: params.offset || 0,
    });
    if (error) throw error;
    return (data as any) || [];
  },

  async getDetail(listingId: string) {
    const { data, error } = await supabase.rpc('get_listing_detail', { listing_uuid: listingId });
    if (error) throw error;
    return data;
  },

  async getFeatured(limit = 6): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings').select('*')
      .eq('status', 'active').eq('is_featured', true)
      .order('rating_avg', { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  },

  async getByHost(hostId: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings').select('*')
      .eq('host_id', hostId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(listing: any) {
    const { data, error } = await supabase.from('listings').insert(listing).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Listing>) {
    const { data, error } = await supabase.from('listings').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async getCategories() {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    return data || [];
  },

  async getAmenities() {
    const { data } = await supabase.from('amenities').select('*');
    return data || [];
  },

  async getImages(listingId: string) {
    const { data } = await supabase.from('listing_images').select('*').eq('listing_id', listingId).order('sort_order');
    return data || [];
  },

  async getSimilar(listingId: string, categoryId: string, limit = 3): Promise<Listing[]> {
    const { data } = await supabase
      .from('listings').select('*')
      .eq('status', 'active').eq('category_id', categoryId)
      .neq('id', listingId).limit(limit);
    return data || [];
  },
};

// ---- BOOKINGS ----

export const bookings = {
  async calculatePrice(listingId: string, duration: BookingDuration): Promise<BookingPriceCalculation> {
    const { data, error } = await supabase.rpc('calculate_booking_price', {
      p_listing_id: listingId, p_duration: duration,
    });
    if (error) throw error;
    return data as any;
  },

  async create(booking: any): Promise<BookingRequest> {
    const { data, error } = await supabase.from('booking_requests').insert(booking).select().single();
    if (error) throw error;
    return data;
  },

  async getForGuest(guestId: string): Promise<BookingRequest[]> {
    const { data } = await supabase.from('booking_requests').select('*').eq('guest_id', guestId).order('created_at', { ascending: false });
    return data || [];
  },

  async getForHost(hostId: string): Promise<BookingRequest[]> {
    const { data } = await supabase.from('booking_requests').select('*').eq('host_id', hostId).order('created_at', { ascending: false });
    return data || [];
  },

  async approve(id: string, response?: string) {
    const { data, error } = await supabase.from('booking_requests')
      .update({ status: 'approved' as BookingStatus, host_response: response || null, responded_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async decline(id: string, response?: string) {
    const { data, error } = await supabase.from('booking_requests')
      .update({ status: 'declined' as BookingStatus, host_response: response || null, responded_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async cancel(id: string) {
    const { data, error } = await supabase.from('booking_requests')
      .update({ status: 'cancelled' as BookingStatus }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async getAll(): Promise<BookingRequest[]> {
    const { data } = await supabase.from('booking_requests').select('*').order('created_at', { ascending: false });
    return data || [];
  },
};

// ---- MESSAGES ----

export const messages = {
  async getOrCreateThread(listingId: string, guestId: string, hostId: string, bookingId?: string): Promise<MessageThread> {
    const { data: existing } = await supabase.from('message_threads').select('*')
      .eq('listing_id', listingId).eq('guest_id', guestId).eq('host_id', hostId).single();
    if (existing) return existing;

    const { data, error } = await supabase.from('message_threads')
      .insert({ listing_id: listingId, guest_id: guestId, host_id: hostId, booking_id: bookingId || null })
      .select().single();
    if (error) throw error;
    return data;
  },

  async getThreads(userId: string): Promise<MessageThread[]> {
    const { data } = await supabase.from('message_threads').select('*')
      .or(`guest_id.eq.${userId},host_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });
    return data || [];
  },

  async getMessages(threadId: string): Promise<Message[]> {
    const { data } = await supabase.from('messages').select('*').eq('thread_id', threadId).order('created_at');
    return data || [];
  },

  async send(threadId: string, senderId: string, body: string): Promise<Message> {
    const { data, error } = await supabase.from('messages')
      .insert({ thread_id: threadId, sender_id: senderId, body }).select().single();
    if (error) throw error;
    return data;
  },

  async markRead(threadId: string, userId: string) {
    await supabase.from('messages').update({ is_read: true }).eq('thread_id', threadId).neq('sender_id', userId);
  },

  subscribeToThread(threadId: string, callback: (msg: Message) => void) {
    return supabase.channel(`thread:${threadId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId}` },
        (payload) => callback(payload.new as Message))
      .subscribe();
  },
};

// ---- FAVORITES ----

export const favorites = {
  async getAll(userId: string): Promise<string[]> {
    const { data } = await supabase.from('favorites').select('listing_id').eq('user_id', userId);
    return (data || []).map(f => f.listing_id);
  },

  async toggle(userId: string, listingId: string): Promise<boolean> {
    const { data: existing } = await supabase.from('favorites').select('*')
      .eq('user_id', userId).eq('listing_id', listingId).single();
    if (existing) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('listing_id', listingId);
      return false;
    } else {
      await supabase.from('favorites').insert({ user_id: userId, listing_id: listingId });
      return true;
    }
  },
};

// ---- VENDORS ----

export const vendors = {
  async getAll(): Promise<Vendor[]> {
    const { data } = await supabase.from('vendors').select('*').eq('is_active', true).order('sort_order');
    return data || [];
  },
};

// ---- HOST ----

export const host = {
  async getStats(hostId: string): Promise<HostStats> {
    const { data, error } = await supabase.rpc('get_host_stats', { host_uuid: hostId });
    if (error) throw error;
    return data as any;
  },
};

// ---- STORAGE ----

export const storage = {
  async uploadListingImage(listingId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `${listingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('listing-images').upload(path, file, { cacheControl: '3600' });
    if (error) throw error;
    const { data } = supabase.storage.from('listing-images').getPublicUrl(path);
    await supabase.from('listing_images').insert({
      listing_id: listingId, url: data.publicUrl, storage_path: path,
      alt_text: file.name, sort_order: 0, is_primary: false,
    });
    return data.publicUrl;
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { cacheControl: '3600', upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId);
    return data.publicUrl;
  },
};

// ---- ADMIN ----

export const admin = {
  async getAllListings(): Promise<Listing[]> {
    const { data } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async approveListing(id: string) { return listings.update(id, { status: 'active' }); },
  async rejectListing(id: string, reason?: string) { return listings.update(id, { status: 'rejected', admin_notes: reason }); },
  async toggleFeatured(id: string, featured: boolean) { return listings.update(id, { is_featured: featured }); },
  async getAllUsers(): Promise<Profile[]> {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    return data || [];
  },
};
