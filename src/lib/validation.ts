/** Shared validation helpers — mirror rules on client and server */

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export const INDIAN_PHONE_ERROR =
  "Please enter a valid 10-digit Indian mobile number";

/** Strip spaces/dashes and optional +91/91 prefix; returns 10-digit mobile or null */
export function normalizeIndianPhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;

  let cleaned = trimmed.replace(/[\s-]/g, "");

  if (/[a-zA-Z]/.test(cleaned)) return null;

  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  }

  if (!/^\d+$/.test(cleaned) || !INDIAN_PHONE_REGEX.test(cleaned)) {
    return null;
  }

  return cleaned;
}

export function isValidIndianPhone(phone: string): boolean {
  return normalizeIndianPhone(phone) !== null;
}

export function isValidPincode(pincode: string): boolean {
  return PINCODE_REGEX.test(pincode.trim());
}

export function validateOrderCustomerPhone(phone: string | undefined): {
  valid: true;
  phone: string;
} | {
  valid: false;
  error: string;
} {
  const normalized = normalizeIndianPhone(phone ?? "");
  if (!normalized) {
    return { valid: false, error: INDIAN_PHONE_ERROR };
  }
  return { valid: true, phone: normalized };
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`
): string {
  return count === 1 ? singular : plural;
}

export function formatItemCount(count: number): string {
  return `${count} ${pluralize(count, "item")}`;
}
