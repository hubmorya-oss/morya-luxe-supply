import { NextResponse } from "next/server";
import { saveOrderServer, verifyOrderTotals } from "@/lib/orders";
import { validateOrderCustomerDetails } from "@/lib/validation";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { parseJsonBody } from "@/lib/parse-json";
import { Order } from "@/types";

/** Save pending order before Razorpay modal — webhook can reconcile if client verify fails */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`razorpay-pending:${ip}`, 15, 60_000);
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.retryAfterSec!);
  }

  const { data: body, error: parseError } = await parseJsonBody(req);
  if (parseError) return parseError;

  try {
    const orderDetails = body as unknown as Order;

    if (!orderDetails?.items?.length || !orderDetails.customerDetails) {
      return NextResponse.json({ error: "Invalid order details" }, { status: 400 });
    }

    const customerValidation = validateOrderCustomerDetails(orderDetails.customerDetails);
    if (!customerValidation.valid) {
      return NextResponse.json(
        { error: customerValidation.error, fieldErrors: customerValidation.fieldErrors },
        { status: 400 }
      );
    }

    const verification = await verifyOrderTotals(orderDetails);
    if (!verification.valid) {
      return NextResponse.json({ error: verification.error }, { status: 400 });
    }

    const pendingOrder: Order = {
      ...orderDetails,
      customerDetails: customerValidation.data,
      subtotal: verification.verifiedSubtotal!,
      shipping: verification.verifiedShipping!,
      grandTotal: verification.verifiedGrandTotal!,
      paymentStatus: "pending",
      paymentMethod: "razorpay",
    };

    const saved = await saveOrderServer(pendingOrder, { upsert: true });
    if (!saved.success) {
      return NextResponse.json(
        { error: saved.error || "Failed to save pending order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, orderId: pendingOrder.id });
  } catch (error) {
    console.error("Pending order save error:", error);
    return NextResponse.json({ error: "Failed to save pending order" }, { status: 500 });
  }
}
