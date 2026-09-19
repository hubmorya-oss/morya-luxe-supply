import { createClient } from "@supabase/supabase-js";
import { Product, Order, BulkInquiryLead } from "@/types";
import { MOCK_PRODUCTS } from "@/data/mockProducts";

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

    if (error || !data || data.length === 0) {
      console.warn("Supabase fetch returned empty/error, using default catalog:", error?.message);
      return MOCK_PRODUCTS;
    }

    // Map database snake_case to TypeScript camelCase
    return data.map((item: any) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      brand: item.brand,
      category: item.category,
      categoryName: item.category_name,
      description: item.description,
      retailMrp: Number(item.retail_mrp),
      wholesalePrice: Number(item.wholesale_price),
      moq: item.moq || 1,
      tierPricing: item.tier_pricing || [],
      inStock: item.in_stock ?? true,
      stockCount: item.stock_count || 0,
      rating: Number(item.rating) || 5.0,
      reviewsCount: item.reviews_count || 0,
      badge: item.badge,
      imageUrl: item.image_url,
      features: item.features || [],
      specs: item.specs || {},
    }));
  } catch (err) {
    console.error("Error connecting to Supabase, fallback active:", err);
    return MOCK_PRODUCTS;
  }
}

/**
 * Save an order to Supabase or local storage backup
 */
export async function saveOrder(order: Order): Promise<{ success: boolean; orderId: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("orders").insert([
        {
          id: order.id,
          customer_name: order.customerDetails.fullName,
          salon_name: order.customerDetails.salonName,
          phone: order.customerDetails.phone,
          email: order.customerDetails.email || null,
          address: order.customerDetails.address,
          city: order.customerDetails.city,
          state: order.customerDetails.state,
          pincode: order.customerDetails.pincode,
          gstin: order.customerDetails.gstin || null,
          items: order.items,
          subtotal: order.subtotal,
          wholesale_savings: order.wholesaleSavings,
          shipping: order.shipping,
          gst_amount: order.gstAmount,
          grand_total: order.grandTotal,
          payment_method: order.paymentMethod,
          payment_status: order.paymentStatus,
          razorpay_order_id: order.razorpayOrderId || null,
          razorpay_payment_id: order.razorpayPaymentId || null,
          order_notes: order.customerDetails.orderNotes || null,
        },
      ]);

      if (error) {
        console.error("Failed to insert order to Supabase:", error.message);
      }
    } catch (err) {
      console.error("Error saving order to Supabase:", err);
    }
  }

  // Also persist in browser localStorage for client review
  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem("morya_orders") || "[]");
      existing.unshift(order);
      localStorage.setItem("morya_orders", JSON.stringify(existing.slice(0, 20)));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  return { success: true, orderId: order.id };
}

/**
 * Submit B2B Salon Setup / Bulk Quote Lead
 */
export async function submitBulkInquiry(lead: BulkInquiryLead): Promise<{ success: boolean }> {
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
      }
    } catch (err) {
      console.error("Supabase inquiry submission exception:", err);
    }
  }

  return { success: true };
}
