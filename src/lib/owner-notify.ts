import { Order } from "@/types";

/** Optional owner email via Resend free tier (100 emails/day). Customer emails stay with Razorpay. */
export async function sendOwnerOrderEmail(order: Order): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;
  const fromEmail = process.env.ORDER_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey || !ownerEmail) {
    return false;
  }

  const items = order.items
    .map((i) => `• ${i.productName} × ${i.quantity} — ₹${i.subtotal.toLocaleString("en-IN")}`)
    .join("\n");

  const paymentLabel =
    order.paymentMethod === "razorpay"
      ? order.paymentStatus === "paid"
        ? "Paid via Razorpay"
        : "Razorpay (pending)"
      : "WhatsApp / COD request";

  const text = [
    `New order ${order.id}`,
    ``,
    `Salon: ${order.customerDetails.salonName}`,
    `Customer: ${order.customerDetails.fullName}`,
    `Phone: ${order.customerDetails.phone}`,
    order.customerDetails.email ? `Email: ${order.customerDetails.email}` : "",
    `City: ${order.customerDetails.city}, ${order.customerDetails.state}`,
    ``,
    `Items:`,
    items,
    ``,
    `Total: ₹${order.grandTotal.toLocaleString("en-IN")}`,
    `Payment: ${paymentLabel}`,
    order.razorpayPaymentId ? `Razorpay Payment ID: ${order.razorpayPaymentId}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Morya Luxe Orders <${fromEmail}>`,
        to: [ownerEmail],
        subject: `[New Order] ${order.id} — ${order.customerDetails.salonName}`,
        text,
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Owner order email error:", error);
    return false;
  }
}

/**
 * Free personal WhatsApp ping to owner via CallMeBot (https://www.callmebot.com/blog/free-api-whatsapp-messages/)
 * One-time setup: message CallMeBot on WhatsApp to get apikey. Optional.
 */
export async function sendOwnerWhatsAppPing(order: Order): Promise<boolean> {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  const ownerPhone = process.env.CALLMEBOT_PHONE || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  if (!apiKey || !ownerPhone) {
    return false;
  }

  const phone = ownerPhone.replace(/\D/g, "");
  const text = encodeURIComponent(
    `🛒 New order ${order.id}\n${order.customerDetails.salonName}\n₹${order.grandTotal} — ${order.paymentMethod === "razorpay" ? "Paid" : "WhatsApp COD"}`
  );

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${text}&apikey=${apiKey}`;
    const res = await fetch(url);
    return res.ok;
  } catch (error) {
    console.error("CallMeBot WhatsApp ping error:", error);
    return false;
  }
}
