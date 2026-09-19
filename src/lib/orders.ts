import { Order, Product } from "@/types";
import { getProducts } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export function calculateUnitTierPrice(product: Product, qty: number): number {
  if (!product.tierPricing || product.tierPricing.length === 0) {
    return product.wholesalePrice;
  }
  const sortedTiers = [...product.tierPricing].sort((a, b) => b.minQty - a.minQty);
  for (const tier of sortedTiers) {
    if (qty >= tier.minQty) {
      return tier.unitPrice;
    }
  }
  return product.wholesalePrice;
}

export async function verifyOrderTotals(order: Order): Promise<{
  valid: boolean;
  error?: string;
  verifiedSubtotal?: number;
  verifiedShipping?: number;
  verifiedGrandTotal?: number;
}> {
  const products = await getProducts();
  let verifiedSubtotal = 0;

  for (const item of order.items) {
    const dbProduct = products.find((p) => p.id === item.productId);
    if (!dbProduct) {
      return { valid: false, error: "Invalid product in cart" };
    }
    const validQty = Math.max(item.quantity, dbProduct.moq || 1);
    const tierPrice = calculateUnitTierPrice(dbProduct, validQty);
    verifiedSubtotal += tierPrice * validQty;
  }

  const verifiedShipping =
    verifiedSubtotal >= 5000 || verifiedSubtotal === 0 ? 0 : 199;
  const verifiedGrandTotal = verifiedSubtotal + verifiedShipping;

  if (verifiedGrandTotal !== order.grandTotal) {
    return {
      valid: false,
      error: "Cart payload mismatch detected. Tampering prevented.",
    };
  }

  return {
    valid: true,
    verifiedSubtotal,
    verifiedShipping,
    verifiedGrandTotal,
  };
}

function orderToRow(order: Order) {
  return {
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
  };
}

export type DbOrderRow = ReturnType<typeof orderToRow>;

/** Persist order via Supabase service role — server-side only */
export async function saveOrderServer(
  order: Order,
  options?: { upsert?: boolean }
): Promise<{ success: boolean; orderId: string; error?: string }> {
  const admin = getSupabaseAdmin();

  if (admin) {
    const row = orderToRow(order);
    const query = options?.upsert
      ? admin.from("orders").upsert([row], { onConflict: "id" })
      : admin.from("orders").insert([row]);

    const { error } = await query;

    if (error) {
      console.error("Failed to save order to Supabase:", error.message);
      return { success: false, orderId: order.id, error: error.message };
    }
  }

  return { success: true, orderId: order.id };
}

export async function getOrderByRazorpayOrderId(
  razorpayOrderId: string
): Promise<(DbOrderRow & { id: string }) | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data, error } = await admin
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (error || !data) return null;
  return data as DbOrderRow & { id: string };
}

export async function markOrderPaidByRazorpayOrderId(
  razorpayOrderId: string,
  razorpayPaymentId: string
): Promise<{
  updated: boolean;
  alreadyPaid: boolean;
  order: (DbOrderRow & { id: string }) | null;
}> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { updated: false, alreadyPaid: false, order: null };
  }

  const existing = await getOrderByRazorpayOrderId(razorpayOrderId);
  if (!existing) {
    return { updated: false, alreadyPaid: false, order: null };
  }

  if (existing.payment_status === "paid") {
    return { updated: false, alreadyPaid: true, order: existing };
  }

  const { data, error } = await admin
    .from("orders")
    .update({
      payment_status: "paid",
      razorpay_payment_id: razorpayPaymentId,
    })
    .eq("razorpay_order_id", razorpayOrderId)
    .eq("payment_status", "pending")
    .select()
    .maybeSingle();

  if (error) {
    console.error("Webhook order update failed:", error.message);
    return { updated: false, alreadyPaid: false, order: existing };
  }

  if (!data) {
    const refreshed = await getOrderByRazorpayOrderId(razorpayOrderId);
    if (refreshed?.payment_status === "paid") {
      return { updated: false, alreadyPaid: true, order: refreshed };
    }
    return { updated: false, alreadyPaid: false, order: refreshed };
  }

  return { updated: true, alreadyPaid: false, order: data as DbOrderRow & { id: string } };
}
