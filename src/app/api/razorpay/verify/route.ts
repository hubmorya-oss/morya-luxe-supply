import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  saveOrderServer,
  verifyOrderTotals,
  getOrderByRazorpayOrderId,
} from "@/lib/orders";
import { notifyPaidOrder } from "@/lib/order-notifications";
import { isLiveRazorpayConfigured, isDemoModeEnabled } from "@/lib/config";
import { validateOrderCustomerDetails } from "@/lib/validation";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { parseJsonBody } from "@/lib/parse-json";
import { Order } from "@/types";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`verify:${ip}`, 15, 60_000);
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.retryAfterSec!);
  }

  const { data: body, error: parseError } = await parseJsonBody(req);
  if (parseError) return parseError;

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
      isDemo,
    } = body as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      orderDetails?: Order;
      isDemo?: boolean;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !orderDetails) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: razorpay_order_id, razorpay_payment_id, orderDetails",
        },
        { status: 400 }
      );
    }

    if (!orderDetails.items?.length || !orderDetails.customerDetails) {
      return NextResponse.json(
        { success: false, error: "Invalid order details payload" },
        { status: 400 }
      );
    }

    const customerValidation = validateOrderCustomerDetails(
      orderDetails.customerDetails
    );
    if (!customerValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: customerValidation.error,
          fieldErrors: customerValidation.fieldErrors,
        },
        { status: 400 }
      );
    }

    const isLive = isLiveRazorpayConfigured();
    const isMockOrder =
      isDemo === true ||
      razorpay_order_id.startsWith("order_morya_test_") ||
      razorpay_payment_id.startsWith("pay_demo_") ||
      razorpay_payment_id.startsWith("pay_mock_");

    if (isLive) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET!;
      if (!razorpay_signature) {
        return NextResponse.json(
          { success: false, error: "Payment signature is required" },
          { status: 400 }
        );
      }

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
    } else if (isMockOrder) {
      const demoAllowed =
        isDemoModeEnabled() || razorpay_order_id.startsWith("order_morya_test_");
      if (!demoAllowed) {
        return NextResponse.json(
          { success: false, error: "Demo checkout is disabled" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Payment verification failed — invalid credentials or signature" },
        { status: 400 }
      );
    }

    const verification = await verifyOrderTotals(orderDetails);
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 400 }
      );
    }

    const existingOrder = await getOrderByRazorpayOrderId(razorpay_order_id);
    const alreadyPaid = existingOrder?.payment_status === "paid";

    const isDemoCheckout = isMockOrder && !isLive;
    const completedOrder: Order = {
      ...orderDetails,
      customerDetails: customerValidation.data,
      subtotal: verification.verifiedSubtotal!,
      shipping: verification.verifiedShipping!,
      grandTotal: verification.verifiedGrandTotal!,
      paymentStatus: isDemoCheckout ? "pending" : "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    };

    const saved = await saveOrderServer(completedOrder, { upsert: true });
    if (!saved.success) {
      return NextResponse.json(
        { success: false, error: saved.error || "Failed to persist order" },
        { status: 500 }
      );
    }

    if (!isDemoCheckout && !alreadyPaid) {
      await notifyPaidOrder(completedOrder, {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amountPaise: Math.round(completedOrder.grandTotal * 100),
        source: "verify",
      });
    }

    return NextResponse.json({
      success: true,
      isDemo: isDemoCheckout,
      message: isDemoCheckout
        ? "Demo order recorded successfully (no payment captured)"
        : "Payment verified and order booked successfully",
      orderId: completedOrder.id,
    });
  } catch (error: unknown) {
    console.error("Payment verification error:", error);
    const msg = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
