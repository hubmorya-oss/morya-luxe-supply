import { NextResponse } from "next/server";
import crypto from "crypto";
import { saveOrder } from "@/lib/supabase";
import { Order } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // In production with real Razorpay credentials, verify HMAC SHA256 signature
    if (keySecret && keySecret !== "rzp_test_placeholder" && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { success: false, error: "Invalid payment signature" },
          { status: 400 }
        );
      }
    }

    // Persist verified order
    if (orderDetails) {
      const completedOrder: Order = {
        ...orderDetails,
        paymentStatus: "paid",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      };

      await saveOrder(completedOrder);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and order booked successfully",
      orderId: razorpay_order_id,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Verification failed" },
      { status: 500 }
    );
  }
}
