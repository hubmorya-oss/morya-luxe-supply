import { createClient } from "@supabase/supabase-js";
import { Product, Order, BulkInquiryLead } from "@/types";
import { MOCK_PRODUCTS } from "@/data/mockProducts";
import { mapRowToProduct } from "@/lib/product-mapper";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project.supabase.co"
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch all products, with seamless fallback to curated wholesale catalog
 */
export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabase) {
    return MOCK_PRODUCTS;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch failed, using default catalog:", error.message);
      return MOCK_PRODUCTS;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item) => mapRowToProduct(item));
  } catch (err) {
    console.error("Error connecting to Supabase, fallback active:", err);
    return MOCK_PRODUCTS;
  }
}

/** Client-side local order history only — no Supabase writes from browser */
export function saveOrderToLocalStorage(order: Order): void {
  if (typeof window === "undefined") return;

  try {
    const existing = JSON.parse(localStorage.getItem("morya_orders") || "[]");
    existing.unshift(order);
    localStorage.setItem("morya_orders", JSON.stringify(existing.slice(0, 20)));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

/**
 * Submit B2B Salon Setup / Bulk Quote Lead (server-side via API; direct for SSR if needed)
 */
export async function submitBulkInquiry(
  lead: BulkInquiryLead
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("bulk_inquiries").insert([
        {
          salon_name: lead.salonName,
          contact_person: lead.contactPerson,
          phone: lead.phone,
          email: lead.email,
          city: lead.city,
          state: lead.state,
          requirement_type: lead.requirementType,
          estimated_budget: lead.estimatedBudget,
          message: lead.message,
        },
      ]);
      if (error) {
        console.error("Supabase inquiry insert failed:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      console.error("Supabase inquiry submission exception:", err);
      const msg = err instanceof Error ? err.message : "Database error";
      return { success: false, error: msg };
    }
  }

  // No Supabase — still accept inquiry (Slack may notify)
  return { success: true };
}
