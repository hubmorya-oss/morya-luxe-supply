import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function getAdminEmailAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAILS || "hubmorya@gmail.com";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmailAllowlist().includes(email.trim().toLowerCase());
}

export async function getAdminSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAdminEmail(user.email)) {
    return { user: null, supabase };
  }

  return { user, supabase };
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session.user) {
    redirect("/admin/login");
  }
  return session;
}
