/** Shared site configuration — client-safe constants */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://moryaluxesupply.com";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918805589150";

export const WHATSAPP_DISPLAY =
  process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || "+91 88055 89150";

export function isDemoModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function whatsappUrl(message: string): string {
  const digits = WHATSAPP_NUMBER.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Open WhatsApp reliably — avoids mobile popup blockers from window.open */
export function openWhatsApp(message: string): void {
  if (typeof window === "undefined") return;

  const url = whatsappUrl(message);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function telUrl(): string {
  const digits = WHATSAPP_NUMBER.replace(/\D/g, "");
  return `tel:+${digits}`;
}

export function getPublicRazorpayKeyId(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
}

export function isLiveRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(
    keyId &&
      keySecret &&
      keyId !== "rzp_test_placeholder" &&
      keySecret !== "rzp_test_placeholder"
  );
}

