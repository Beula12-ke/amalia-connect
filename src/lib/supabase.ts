import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// 1. Hardcode the URL (removes the /rest/v1 issue forever)
const url = "https://ssdryhsaeqzekaemehes.supabase.co";

// 2. Keep the key as an environment variable (or hardcode it if you prefer)
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});