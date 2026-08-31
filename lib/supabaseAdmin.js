import "server-only";
import { createClient } from "@supabase/supabase-js";

let client = null;

export function getSupabaseAdmin() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase n'est pas configuré : renseigne NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local"
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}
