import { NextResponse } from "next/server";
import { submitBulkInquiry } from "@/lib/supabase";
import { sendSlackInquiryNotification } from "@/lib/slack";
import { validateBulkInquiryLead } from "@/lib/validation";
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
    const validation = validateBulkInquiryLead(body as unknown as BulkInquiryLead);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, fieldErrors: validation.fieldErrors },
        { status: 400 }
      );
    }

    const lead = validation.data;

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
