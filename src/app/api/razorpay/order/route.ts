import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt = `rcpt_${Date.now()}` } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount for order creation" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Production mode with real credentials
    if (keyId && keySecret && keyId !== "rzp_test_placeholder") {
      const instance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await instance.orders.create({
        amount: Math.round(amount * 100), // convert to paise
        currency,
        receipt,
        payment_capture: true,
      });

      return NextResponse.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
      });
    }

    // Development / Mock test mode for seamless testing prior to live Razorpay keys
    const mockOrderId = `order_morya_test_${Date.now()}`;
    return NextResponse.json({
      id: mockOrderId,
      amount: Math.round(amount * 100),
      currency: "INR",
      keyId: keyId || "rzp_test_morya_demo",
      isMock: true,
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
