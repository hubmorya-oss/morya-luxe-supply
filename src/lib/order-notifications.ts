import { Order } from "@/types";
import { DbOrderRow } from "@/lib/orders";
import { sendSlackOrderNotification } from "@/lib/slack";
import { sendOwnerOrderEmail, sendOwnerWhatsAppPing } from "@/lib/owner-notify";

export function dbRowToOrder(row: DbOrderRow & { id: string; created_at?: string }): Order {
  const items = Array.isArray(row.items) ? row.items : [];
  return {
    id: row.id,
    customerDetails: {
      fullName: row.customer_name,
      salonName: row.salon_name,
      phone: row.phone,
      email: row.email || undefined,
      address: row.address,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      gstin: row.gstin || undefined,
      orderNotes: row.order_notes || undefined,
    },
    items: items as Order["items"],
    subtotal: Number(row.subtotal),
    wholesaleSavings: Number(row.wholesale_savings),
    shipping: Number(row.shipping),
    gstAmount: Number(row.gst_amount),
    grandTotal: Number(row.grand_total),
    paymentMethod: row.payment_method as Order["paymentMethod"],
    paymentStatus: row.payment_status as Order["paymentStatus"],
    razorpayOrderId: row.razorpay_order_id || undefined,
    razorpayPaymentId: row.razorpay_payment_id || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/** Notify owner on every new order — Slack + optional email + optional WhatsApp ping (all free tiers). */
export async function notifyNewOrder(
  order: Order,
  context?: {
    source?: "verify" | "webhook" | "whatsapp";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    method?: string;
  }
): Promise<{ slackSent: boolean; emailSent: boolean; whatsappSent: boolean }> {
  const isPaidRazorpay = order.paymentMethod === "razorpay" && order.paymentStatus === "paid";
  const isWhatsappCod = order.paymentMethod === "whatsapp";

  const [slackSent, emailSent, whatsappSent] = await Promise.all([
    sendSlackOrderNotification({
      event: isPaidRazorpay ? "payment.captured" : "payment.captured",
      orderType: isWhatsappCod ? "whatsapp_cod" : "razorpay_paid",
      razorpayOrderId: context?.razorpayOrderId || order.razorpayOrderId || "—",
      razorpayPaymentId: context?.razorpayPaymentId || order.razorpayPaymentId || "—",
      amountPaise: Math.round(order.grandTotal * 100),
      method: context?.method || order.paymentMethod,
      customerPhone: order.customerDetails.phone,
      salonName: order.customerDetails.salonName,
      customerName: order.customerDetails.fullName,
      orderId: order.id,
      source: context?.source,
    }),
    sendOwnerOrderEmail(order),
    sendOwnerWhatsAppPing(order),
  ]);

  return { slackSent, emailSent, whatsappSent };
}

/** Razorpay paid order — wraps notifyNewOrder for verify/webhook paths. */
export async function notifyPaidOrder(
  order: Order,
  details: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amountPaise?: number;
    method?: string;
    source: "verify" | "webhook";
  }
): Promise<{ slackSent: boolean; emailSent: boolean; whatsappSent: boolean }> {
  return notifyNewOrder(order, {
    source: details.source,
    razorpayOrderId: details.razorpayOrderId,
    razorpayPaymentId: details.razorpayPaymentId,
    method: details.method,
  });
}
