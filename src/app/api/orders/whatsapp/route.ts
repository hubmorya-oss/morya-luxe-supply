import { NextResponse } from "next/server";
import { saveOrderServer, verifyOrderTotals } from "@/lib/orders";
import { isValidPincode, validateOrderCustomerPhone } from "@/lib/validation";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { parseJsonBody } from "@/lib/parse-json";
import { Order } from "@/types";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`whatsapp-order:${ip}`, 10, 60_000);
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.retryAfterSec!);
  }

  const { data: body, error: parseError } = await parseJsonBody(req);
  if (parseError) return parseError;

  try {
    const { order } = body as { order?: Order };

    if (!order?.customerDetails || !order.items?.length) {
      return NextResponse.json(
        { error: "Invalid order payload" },
        { status: 400 }
      );
    }

    const { customerDetails } = order;

    if (
      !customerDetails.fullName?.trim() ||
      !customerDetails.salonName?.trim() ||
      !customerDetails.address?.trim() ||
      !customerDetails.city?.trim() ||
      !customerDetails.pincode?.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required delivery details" },
        { status: 400 }
      );
    }

    const phoneCheck = validateOrderCustomerPhone(customerDetails.phone);
    if (!phoneCheck.valid) {
      return NextResponse.json({ error: phoneCheck.error }, { status: 400 });
    }

    if (!isValidPincode(customerDetails.pincode)) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit Indian pincode" },
        { status: 400 }
      );
    }

    const verification = await verifyOrderTotals(order);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error },
        { status: 400 }
      );
    }

    const codOrder: Order = {
      ...order,
      customerDetails: {
        ...customerDetails,
        phone: phoneCheck.phone,
      },
      subtotal: verification.verifiedSubtotal!,
      shipping: verification.verifiedShipping!,
      grandTotal: verification.verifiedGrandTotal!,
      paymentMethod: "whatsapp",
      paymentStatus: "cod_requested",
    };

    const saved = await saveOrderServer(codOrder);
    if (!saved.success) {
      return NextResponse.json(
        { error: saved.error || "Failed to save order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: saved.orderId,
    });
  } catch (error: unknown) {
    console.error("WhatsApp order error:", error);
    const msg = error instanceof Error ? error.message : "Failed to process order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
