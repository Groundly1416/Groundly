import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// createBrowserClient writes the session to a cookie that the App Router
// server (route handlers, server components) can read via @supabase/ssr's
// createServerClient + next/headers cookies(). The API surface is otherwise
// identical to @supabase/supabase-js createClient — same auth methods,
// same .from() builder, same generated Database typing.
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
