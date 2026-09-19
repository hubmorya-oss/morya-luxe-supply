import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { isLiveRazorpayConfigured } from "@/lib/config";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { parseJsonBody } from "@/lib/parse-json";

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

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (isLiveRazorpayConfigured() && keyId && keySecret) {
      const instance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await instance.orders.create({
        amount: Math.round(amount * 100),
        currency,
        receipt,
        payment_capture: true,
      });

      return NextResponse.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
        isMock: false,
      });
    }

    const mockOrderId = `order_morya_test_${Date.now()}`;
    return NextResponse.json({
      id: mockOrderId,
      amount: Math.round(amount * 100),
      currency: "INR",
      keyId: keyId || "rzp_test_morya_demo",
      isMock: true,
    });
  } catch (error: unknown) {
    console.error("Razorpay order creation error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create Razorpay order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
