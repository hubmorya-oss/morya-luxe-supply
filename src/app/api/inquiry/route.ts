import { NextResponse } from "next/server";
import { submitBulkInquiry } from "@/lib/supabase";
import { sendSlackInquiryNotification } from "@/lib/slack";
import { isValidIndianPhone } from "@/lib/validation";
import { BulkInquiryLead } from "@/types";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { parseJsonBody } from "@/lib/parse-json";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`inquiry:${ip}`, 10, 60_000);
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.retryAfterSec!);
  }

  const { data: body, error: parseError } = await parseJsonBody(req);
  if (parseError) return parseError;

  try {
    const {
      salonName,
      contactPerson,
      phone,
      email = "",
      city,
      state = "Maharashtra",
      requirementType,
      estimatedBudget,
      message = "",
    } = body as {
      salonName?: string;
      contactPerson?: string;
      phone?: string;
      email?: string;
      city?: string;
      state?: string;
      requirementType?: string;
      estimatedBudget?: string;
      message?: string;
    };

    if (!salonName?.trim() || !contactPerson?.trim() || !phone?.trim() || !city?.trim()) {
      return NextResponse.json(
        { error: "Missing required contact details" },
        { status: 400 }
      );
    }

    if (!isValidIndianPhone(phone.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }

    const validRequirementTypes = [
      "new_salon_setup",
      "recurring_monthly_supply",
      "custom_bulk_order",
    ] as const;
    const resolvedRequirementType = validRequirementTypes.includes(
      requirementType as (typeof validRequirementTypes)[number]
    )
      ? (requirementType as BulkInquiryLead["requirementType"])
      : "new_salon_setup";

    const lead: BulkInquiryLead = {
      salonName: salonName.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      state: state.trim(),
      requirementType: resolvedRequirementType,
      estimatedBudget: estimatedBudget || "₹50,000 - ₹1,50,000",
      message: message.trim(),
    };

    const dbResult = await submitBulkInquiry(lead);
    if (!dbResult.success) {
      return NextResponse.json(
        { error: dbResult.error || "Failed to save inquiry" },
        { status: 500 }
      );
    }

    const slackSent = await sendSlackInquiryNotification(lead);

    return NextResponse.json({
      success: true,
      message: "Inquiry submitted successfully",
      slackNotified: slackSent,
    });
  } catch (error: unknown) {
    console.error("Error processing salon inquiry:", error);
    const msg = error instanceof Error ? error.message : "Failed to submit inquiry";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
