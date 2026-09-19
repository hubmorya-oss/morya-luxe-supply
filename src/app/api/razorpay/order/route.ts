import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { isLiveRazorpayConfigured } from "@/lib/config";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { parseJsonBody } from "@/lib/parse-json";

type RazorpayApiError = {
  statusCode?: number;
  error?: { description?: string; code?: string };
};

function getRazorpayErrorStatus(error: unknown): number | undefined {
  if (error && typeof error === "object" && "statusCode" in error) {
    const statusCode = (error as RazorpayApiError).statusCode;
    return typeof statusCode === "number" ? statusCode : undefined;
  }
  return undefined;
}

function getRazorpayErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (error && typeof error === "object" && "error" in error) {
    const description = (error as RazorpayApiError).error?.description;
    if (description) return description;
  }
  return "Failed to create Razorpay order";
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`razorpay-order:${ip}`, 20, 60_000);
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.retryAfterSec!);
  }

  const { data: body, error: parseError } = await parseJsonBody(req);
  if (parseError) return parseError;

  try {
    const { amount, currency = "INR", receipt = `rcpt_${Date.now()}` } = body as {
      amount?: number;
      currency?: string;
      receipt?: string;
    };

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount for order creation" },
        { status: 400 }
      );
    }

    const amountPaise = Math.round(amount * 100);
    if (amountPaise < 100) {
      return NextResponse.json(
        { error: "Minimum order amount is 100 paise (₹1)" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (isLiveRazorpayConfigured() && keyId && keySecret) {
      const instance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await instance.orders.create({
        amount: amountPaise,
        currency,
        receipt,
        payment_capture: true,
      });

      return NextResponse.json({
        id: order.id,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        isMock: false,
      });
    }

    const mockOrderId = `order_morya_test_${Date.now()}`;
    return NextResponse.json({
      id: mockOrderId,
      order_id: mockOrderId,
      amount: amountPaise,
      currency: "INR",
      isMock: true,
    });
  } catch (error: unknown) {
    console.error("Razorpay order creation error:", error);

    const razorpayStatus = getRazorpayErrorStatus(error);
    if (razorpayStatus === 401) {
      return NextResponse.json(
        { error: "Razorpay authentication failed. Check API keys." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: getRazorpayErrorMessage(error) },
      { status: razorpayStatus && razorpayStatus >= 400 && razorpayStatus < 600 ? razorpayStatus : 500 }
    );
  }
}
