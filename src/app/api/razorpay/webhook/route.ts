import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  markOrderPaidByRazorpayOrderId,
  getOrderByRazorpayOrderId,
} from "@/lib/orders";
import { sendSlackOrderNotification } from "@/lib/slack";
import { dbRowToOrder, notifyPaidOrder } from "@/lib/order-notifications";

export const runtime = "nodejs";

type RazorpayPaymentEntity = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  email?: string;
  contact?: string;
  method?: string;
  error_description?: string;
};

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };
    order?: {
      entity?: {
        id?: string;
        amount?: number;
      };
    };
  };
};

function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}

async function handlePaymentSuccess(
  payment: RazorpayPaymentEntity,
  eventLabel: "payment.captured" | "order.paid"
) {
  const razorpayOrderId = payment.order_id;
  const razorpayPaymentId = payment.id;

  if (!razorpayOrderId || !razorpayPaymentId) return;

  const updated = await markOrderPaidByRazorpayOrderId(
    razorpayOrderId,
    razorpayPaymentId
  );

  const orderRow =
    updated.order ?? (await getOrderByRazorpayOrderId(razorpayOrderId));

  // Notify only when this handler was the first to mark the order paid (idempotent).
  if (updated.updated && orderRow) {
    const order = dbRowToOrder(orderRow);
    await notifyPaidOrder(order, {
      razorpayOrderId,
      razorpayPaymentId,
      amountPaise: payment.amount,
      method: payment.method,
      source: "webhook",
    });
  } else if (eventLabel === "payment.captured" && updated.alreadyPaid && orderRow) {
    // Legacy path: log-only skip — verify route or prior webhook already notified.
    console.info(
      `Webhook ${eventLabel} skipped notifications — order ${orderRow.id} already paid`
    );
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  let body: RazorpayWebhookPayload;
  try {
    body = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const event = body.event;
  const payment = body.payload?.payment?.entity;

  if (!event) {
    return NextResponse.json({ received: true, skipped: "no event" });
  }

  try {
    if (
      (event === "payment.captured" || event === "order.paid") &&
      payment
    ) {
      await handlePaymentSuccess(
        payment,
        event === "order.paid" ? "order.paid" : "payment.captured"
      );
    }

    if (event === "payment.failed" && payment?.order_id) {
      await sendSlackOrderNotification({
        event: "payment.failed",
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id ?? "unknown",
        amountPaise: payment.amount,
        method: payment.method,
        failureReason: payment.error_description,
        source: "webhook",
      });
    }

    return NextResponse.json({ received: true, event });
  } catch (error) {
    console.error("Razorpay webhook handler error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
