import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Keep configuration optional so importing this module never prevents the
// homepage or a production build from rendering.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        // Product availability is live data. Avoid persisting an empty response
        // when Supabase has a temporary network failure during rendering/builds.
        fetch: (input, init = {}) => fetch(input, { ...init, cache: "no-store" }),
      },
    })
  : null;
