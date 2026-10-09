import { createClient } from "@supabase/supabase-js";

// Cookie-less anon client for public storefront reads. Not reading cookies()
// keeps the calling page eligible for static rendering / ISR.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
