/** Shared validation helpers — mirror rules on client and server */

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, "");
  return INDIAN_PHONE_REGEX.test(cleaned);
}

export function isValidPincode(pincode: string): boolean {
  return PINCODE_REGEX.test(pincode.trim());
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
