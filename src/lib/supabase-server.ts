import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function isSupabaseAdminConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
      serviceKey &&
      url !== "https://your-project.supabase.co" &&
      serviceKey !== "your-service-role-key"
  );
}

/** Service-role client for server-side writes (bypasses RLS) */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }

  return adminClient;
}
