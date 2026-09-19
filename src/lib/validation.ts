/** Shared validation helpers — mirror rules on client and server */

import { BulkInquiryLead, OrderCustomerDetails } from "@/types";

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const INDIAN_PHONE_ERROR =
  "Please enter a valid 10-digit Indian mobile number";

export const EMAIL_ERROR = "Please enter a valid email address";

export const GSTIN_ERROR =
  "Please enter a valid 15-character GSTIN (e.g. 27AAAAA0000A1Z5)";

export type FieldErrors = Record<string, string>;

export type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; error: string; fieldErrors: FieldErrors };

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

export function trimRequired(
  value: string | undefined,
  minLength = 2
): string | null {
  const trimmed = (value ?? "").trim();
  if (trimmed.length < minLength) return null;
  return trimmed;
}

export function validateOptionalEmail(
  email: string | undefined
): { valid: true; email: string } | { valid: false; error: string } {
  const trimmed = (email ?? "").trim();
  if (!trimmed) return { valid: true, email: "" };
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: EMAIL_ERROR };
  }
  return { valid: true, email: trimmed.toLowerCase() };
}

export function validateOptionalGstin(
  gstin: string | undefined
): { valid: true; gstin: string } | { valid: false; error: string } {
  const trimmed = (gstin ?? "").trim();
  if (!trimmed) return { valid: true, gstin: "" };
  const normalized = trimmed.toUpperCase();
  if (!GSTIN_REGEX.test(normalized)) {
    return { valid: false, error: GSTIN_ERROR };
  }
  return { valid: true, gstin: normalized };
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

export function validateOrderCustomerDetails(
  raw: OrderCustomerDetails
): ValidationResult<OrderCustomerDetails> {
  const fieldErrors: FieldErrors = {};

  const fullName = trimRequired(raw.fullName, 2);
  if (!fullName) {
    fieldErrors.fullName = "Please enter your owner/barber name (min 2 characters)";
  }

  const salonName = trimRequired(raw.salonName, 2);
  if (!salonName) {
    fieldErrors.salonName =
      "Please enter your salon / barbershop name (min 2 characters)";
  }

  const phoneCheck = validateOrderCustomerPhone(raw.phone);
  if (!phoneCheck.valid) {
    fieldErrors.phone = phoneCheck.error;
  }

  const emailCheck = validateOptionalEmail(raw.email);
  if (!emailCheck.valid) {
    fieldErrors.email = emailCheck.error;
  }

  const address = trimRequired(raw.address, 5);
  if (!address) {
    fieldErrors.address =
      "Please enter delivery address (min 5 characters)";
  }

  const city = trimRequired(raw.city, 2);
  if (!city) {
    fieldErrors.city = "Please enter your city (min 2 characters)";
  }

  const state = trimRequired(raw.state, 2);
  if (!state) {
    fieldErrors.state = "Please enter your state (min 2 characters)";
  }

  const pincode = raw.pincode?.trim() ?? "";
  if (!isValidPincode(pincode)) {
    fieldErrors.pincode = "Please enter a valid 6-digit Indian pincode";
  }

  const gstinCheck = validateOptionalGstin(raw.gstin);
  if (!gstinCheck.valid) {
    fieldErrors.gstin = gstinCheck.error;
  }

  const orderNotes = (raw.orderNotes ?? "").trim();
  if (orderNotes.length > 500) {
    fieldErrors.orderNotes = "Order notes must be 500 characters or fewer";
  }

  const firstError = Object.values(fieldErrors)[0];
  if (firstError || !phoneCheck.valid || !fullName || !salonName || !address || !city || !state) {
    return {
      valid: false,
      error: firstError || "Please fix the highlighted fields",
      fieldErrors,
    };
  }

  return {
    valid: true,
    data: {
      fullName,
      salonName,
      phone: phoneCheck.phone,
      email: emailCheck.valid ? emailCheck.email : "",
      address,
      city,
      state,
      pincode,
      gstin: gstinCheck.valid ? gstinCheck.gstin : "",
      orderNotes,
    },
  };
}

const VALID_REQUIREMENT_TYPES = [
  "new_salon_setup",
  "recurring_monthly_supply",
  "custom_bulk_order",
] as const;

const VALID_BUDGETS = [
  "₹25,000 - ₹50,000",
  "₹50,000 - ₹1,50,000",
  "₹1,00,000 - ₹3,00,000",
  "₹1,50,000 - ₹3,50,000",
  "₹3,50,000+",
] as const;

export function validateBulkInquiryLead(
  raw: BulkInquiryLead
): ValidationResult<BulkInquiryLead> {
  const fieldErrors: FieldErrors = {};

  const salonName = trimRequired(raw.salonName, 2);
  if (!salonName) {
    fieldErrors.salonName =
      "Please enter your salon / academy name (min 2 characters)";
  }

  const contactPerson = trimRequired(raw.contactPerson, 2);
  if (!contactPerson) {
    fieldErrors.contactPerson =
      "Please enter contact person name (min 2 characters)";
  }

  const phoneCheck = validateOrderCustomerPhone(raw.phone);
  if (!phoneCheck.valid) {
    fieldErrors.phone = phoneCheck.error;
  }

  const emailCheck = validateOptionalEmail(raw.email);
  if (!emailCheck.valid) {
    fieldErrors.email = emailCheck.error;
  }

  const city = trimRequired(raw.city, 2);
  if (!city) {
    fieldErrors.city = "Please enter your city (min 2 characters)";
  }

  const state = trimRequired(raw.state, 2);
  if (!state) {
    fieldErrors.state = "Please enter your state (min 2 characters)";
  }

  const requirementType = VALID_REQUIREMENT_TYPES.includes(
    raw.requirementType as (typeof VALID_REQUIREMENT_TYPES)[number]
  )
    ? raw.requirementType
    : null;
  if (!requirementType) {
    fieldErrors.requirementType = "Please select a valid requirement type";
  }

  const estimatedBudget =
    raw.estimatedBudget?.trim() &&
    VALID_BUDGETS.includes(
      raw.estimatedBudget as (typeof VALID_BUDGETS)[number]
    )
      ? raw.estimatedBudget
      : null;
  if (!estimatedBudget) {
    fieldErrors.estimatedBudget = "Please select an estimated budget";
  }

  const message = (raw.message ?? "").trim();
  if (message.length > 1000) {
    fieldErrors.message = "Details must be 1000 characters or fewer";
  }

  const firstError = Object.values(fieldErrors)[0];
  if (
    firstError ||
    !phoneCheck.valid ||
    !salonName ||
    !contactPerson ||
    !city ||
    !state ||
    !requirementType ||
    !estimatedBudget
  ) {
    return {
      valid: false,
      error: firstError || "Please fix the highlighted fields",
      fieldErrors,
    };
  }

  return {
    valid: true,
    data: {
      salonName,
      contactPerson,
      phone: phoneCheck.phone,
      email: emailCheck.valid ? emailCheck.email : "",
      city,
      state,
      requirementType,
      estimatedBudget,
      message,
    },
  };
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
