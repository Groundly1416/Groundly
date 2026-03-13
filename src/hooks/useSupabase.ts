// =============================================================
// GROUNDLY — React Hooks for Supabase
// hooks/useSupabase.ts
//
// Drop-in hooks that connect the React frontend to all 
// Supabase services. Replace the in-memory state management
// in the JSX artifact with these hooks.
// =============================================================

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import {
  supabase,
  listingService,
  bookingService,
  messageService,
  favoritesService,
  vendorService,
  hostService,
  storageService,
  adminService,
  formatPrice,
} from '@/lib/supabase';
import type {
  Profile,
  Listing,
  ListingDetail,
  ListingSearchResult,
  BookingRequest,
  BookingDuration,
  BookingPurpose,
  MessageThread,
  Message,
  Vendor,
  HostStats,
  Category,
  Amenity,
} from '@/types/database';

// =============================================================
// AUTH CONTEXT & HOOK
// =============================================================

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: 'guest' | 'host') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    authService.getProfile().then(profile => {
      setUser(profile);
      setLoading(false);
    }).catch(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        const profile = await authService.getProfile();
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: 'guest' | 'host' = 'guest') => {
    await authService.signUp(email, password, fullName, role);
    const profile = await authService.getProfile();
    setUser(profile);
  };

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
    const profile = await authService.getProfile();
    setUser(profile);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    const updated = await authService.updateProfile(updates);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// =============================================================
// LISTINGS HOOKS
// =============================================================

/** Search and browse listings */
export function useListingSearch() {
  const [results, setResults] = useState<ListingSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    maxGuests?: number;
    sort?: string;
    limit?: number;
    offset?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listingService.search(params);
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}

/** Get full listing detail */
export function useListingDetail(listingId: string | null) {
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) return;
    setLoading(true);
    listingService.getDetail(listingId)
      .then(data => setListing(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [listingId]);

  return { listing, loading, error };
}

/** Get featured listings */
export function useFeaturedListings(limit = 6) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingService.getFeatured(limit)
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit]);

  return { listings, loading };
}

/** Get categories */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    listingService.getCategories().then(setCategories).catch(console.error);
  }, []);

  return categories;
}

/** Get amenities */
export function useAmenities() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  
  useEffect(() => {
    listingService.getAmenities().then(setAmenities).catch(console.error);
  }, []);

  return amenities;
}

/** Host's listings */
export function useHostListings(hostId: string | null) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hostId) return;
    setLoading(true);
    listingService.getByHost(hostId)
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [hostId]);

  const refresh = useCallback(() => {
    if (hostId) listingService.getByHost(hostId).then(setListings);
  }, [hostId]);

  return { listings, loading, refresh };
}

// =============================================================
// BOOKING HOOKS
// =============================================================

/** Guest bookings */
export function useGuestBookings(guestId: string | null) {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!guestId) return;
    setLoading(true);
    bookingService.getForGuest(guestId)
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [guestId]);

  const refresh = useCallback(() => {
    if (guestId) bookingService.getForGuest(guestId).then(setBookings);
  }, [guestId]);

  return { bookings, loading, refresh };
}

/** Host bookings */
export function useHostBookings(hostId: string | null) {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hostId) return;
    setLoading(true);
    bookingService.getForHost(hostId)
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [hostId]);

  const approve = useCallback(async (bookingId: string, response?: string) => {
    await bookingService.approve(bookingId, response);
    if (hostId) bookingService.getForHost(hostId).then(setBookings);
  }, [hostId]);

  const decline = useCallback(async (bookingId: string, response?: string) => {
    await bookingService.decline(bookingId, response);
    if (hostId) bookingService.getForHost(hostId).then(setBookings);
  }, [hostId]);

  return { bookings, loading, approve, decline };
}

/** Booking price calculator */
export function useBookingPrice(listingId: string | null, duration: BookingDuration) {
  const [price, setPrice] = useState<{ session: number; fee: number; total: number } | null>(null);

  useEffect(() => {
    if (!listingId) return;
    bookingService.calculatePrice(listingId, duration)
      .then(data => setPrice({ session: data.session_price, fee: data.service_fee, total: data.total }))
      .catch(console.error);
  }, [listingId, duration]);

  return price;
}

// =============================================================
// FAVORITES HOOK
// =============================================================

export function useFavorites(userId: string | null) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    favoritesService.getAll(userId).then(setFavorites).catch(console.error);
  }, [userId]);

  const toggle = useCallback(async (listingId: string) => {
    if (!userId) return;
    const added = await favoritesService.toggle(userId, listingId);
    setFavorites(prev => added ? [...prev, listingId] : prev.filter(id => id !== listingId));
    return added;
  }, [userId]);

  const isFavorite = useCallback((listingId: string) => favorites.includes(listingId), [favorites]);

  return { favorites, toggle, isFavorite };
}

// =============================================================
// MESSAGING HOOK
// =============================================================

export function useMessages(userId: string | null) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Load threads
  useEffect(() => {
    if (!userId) return;
    messageService.getThreads(userId).then(setThreads).catch(console.error);
  }, [userId]);

  // Load messages for active thread
  useEffect(() => {
    if (!activeThreadId) return;
    messageService.getMessages(activeThreadId).then(setCurrentMessages);

    // Subscribe to realtime
    const channel = messageService.subscribeToThread(activeThreadId, (newMsg) => {
      setCurrentMessages(prev => [...prev, newMsg]);
    });

    return () => { supabase.removeChannel(channel); };
  }, [activeThreadId]);

  const sendMessage = useCallback(async (body: string) => {
    if (!activeThreadId || !userId) return;
    await messageService.sendMessage(activeThreadId, userId, body);
  }, [activeThreadId, userId]);

  const selectThread = useCallback(async (threadId: string) => {
    setActiveThreadId(threadId);
    if (userId) await messageService.markRead(threadId, userId);
  }, [userId]);

  return { threads, currentMessages, activeThreadId, selectThread, sendMessage };
}

// =============================================================
// VENDORS HOOK
// =============================================================

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorService.getAll()
      .then(setVendors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { vendors, loading };
}

// =============================================================
// HOST STATS HOOK
// =============================================================

export function useHostStats(hostId: string | null) {
  const [stats, setStats] = useState<HostStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hostId) return;
    setLoading(true);
    hostService.getStats(hostId)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [hostId]);

  return { stats, loading };
}

// =============================================================
// IMAGE UPLOAD HOOK
// =============================================================

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadListingImage = useCallback(async (listingId: string, file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      const url = await storageService.uploadListingImage(listingId, file);
      setProgress(100);
      return url;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (userId: string, file: File) => {
    setUploading(true);
    try {
      return await storageService.uploadAvatar(userId, file);
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploading, progress, uploadListingImage, uploadAvatar };
}
