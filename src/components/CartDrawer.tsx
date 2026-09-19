"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import {
  X,
  Trash2,
  ShoppingBag,
  MessageCircle,
  CreditCard,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Order } from "@/types";
import { saveOrderToLocalStorage } from "@/lib/supabase";
import {
  getPublicRazorpayKeyId,
  isDemoModeEnabled,
  openWhatsApp,
  whatsappUrl,
  WHATSAPP_DISPLAY,
} from "@/lib/config";
import {
  FieldErrors,
  formatItemCount,
  validateOrderCustomerDetails,
} from "@/lib/validation";

type RazorpayFailureResponse = {
  error?: {
    description?: string;
    reason?: string;
  };
};

type RazorpayCheckoutInstance = {
  open: () => void;
  on: (event: string, handler: (response: RazorpayFailureResponse) => void) => void;
};

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    wholesaleSavings,
    grandTotal,
    customerDetails,
    setCustomerDetails,
  } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [isDemoOrder, setIsDemoOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (!isCartOpen) return null;

  const freeShippingThreshold = 5000;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const cartItemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const buildOrderItems = () =>
    cart.map((c) => ({
      productId: c.product.id,
      productName: c.product.name,
      unitPrice: c.activeTierPrice,
      quantity: c.quantity,
      subtotal: c.subtotal,
    }));

  const fieldErrorStyle: React.CSSProperties = {
    fontSize: "0.72rem",
    color: "#fca5a5",
    marginTop: "4px",
    display: "block",
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleWhatsAppCheckout = async () => {
    const validation = validateOrderCustomerDetails(customerDetails);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      setFieldErrors(validation.fieldErrors);
      return;
    }
    const validatedDetails = validation.data;
    setErrorMessage("");
    setFieldErrors({});
    setIsProcessing(true);

    try {
      const orderId = `MLS-WA-${Date.now().toString().slice(-6)}`;
      const newOrder: Order = {
        id: orderId,
        customerDetails: validatedDetails,
        items: buildOrderItems(),
        subtotal,
        wholesaleSavings,
        shipping: subtotal >= 5000 ? 0 : 199,
        gstAmount: Math.round(subtotal * 0.18),
        grandTotal,
        paymentMethod: "whatsapp",
        paymentStatus: "cod_requested",
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("/api/orders/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save order");
      }

      saveOrderToLocalStorage(newOrder);

      const itemLines = cart
        .map(
          (item, i) =>
            `${i + 1}. *${item.product.name}*\n   Qty: ${item.quantity} units @ ₹${item.activeTierPrice} = *₹${item.subtotal.toLocaleString("en-IN")}*`
        )
        .join("\n\n");

      const message = `*NEW B2B WHOLESALE ORDER - MORYA LUXE SUPPLY*
Order ID: #${orderId}
----------------------------------------
*Salon Details:*
Salon: *${validatedDetails.salonName}*
Owner: *${validatedDetails.fullName}*
Phone: *${validatedDetails.phone}*
Address: ${validatedDetails.address}, ${validatedDetails.city}, ${validatedDetails.state} - ${validatedDetails.pincode}
${validatedDetails.gstin ? `GSTIN: ${validatedDetails.gstin}\n` : ""}${validatedDetails.orderNotes ? `Notes: ${validatedDetails.orderNotes}\n` : ""}
----------------------------------------
*Order Items:*
${itemLines}
----------------------------------------
*Wholesale Subtotal:* ₹${subtotal.toLocaleString("en-IN")}
*You Saved (vs MRP):* ₹${wholesaleSavings.toLocaleString("en-IN")}
*Shipping:* ${subtotal >= 5000 ? "FREE (Wholesale Tier)" : "₹199"}
*Grand Total:* *₹${grandTotal.toLocaleString("en-IN")}*
----------------------------------------
Please confirm my order dispatch timeline and payment details.`;

      openWhatsApp(message);
      setIsDemoOrder(false);
      setOrderSuccess(newOrder);
      clearCart();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process WhatsApp order";
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const completeVerifiedOrder = async (
    pendingOrder: Order,
    verifyPayload: Record<string, unknown>
  ) => {
    const verifyRes = await fetch("/api/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(verifyPayload),
    });
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.success) {
      throw new Error(verifyData.error || "Payment verification failed");
    }

    const completedOrder: Order = {
      ...pendingOrder,
      paymentStatus: verifyData.isDemo ? "pending" : "paid",
      razorpayPaymentId: verifyPayload.razorpay_payment_id as string,
    };

    saveOrderToLocalStorage(completedOrder);
    setIsDemoOrder(Boolean(verifyData.isDemo));
    setOrderSuccess(completedOrder);
    clearCart();
  };

  const handleRazorpayCheckout = async () => {
    const validation = validateOrderCustomerDetails(customerDetails);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      setFieldErrors(validation.fieldErrors);
      return;
    }
    const validatedDetails = validation.data;
    setErrorMessage("");
    setFieldErrors({});
    setIsProcessing(true);

    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotal,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || "Order creation failed");

      const tempOrderId = `MLS-RZP-${Date.now().toString().slice(-6)}`;
      const pendingOrder: Order = {
        id: tempOrderId,
        customerDetails: validatedDetails,
        items: buildOrderItems(),
        subtotal,
        wholesaleSavings,
        shipping: subtotal >= 5000 ? 0 : 199,
        gstAmount: Math.round(subtotal * 0.18),
        grandTotal,
        paymentMethod: "razorpay",
        paymentStatus: "pending",
        razorpayOrderId: orderData.id,
        createdAt: new Date().toISOString(),
      };

      const razorpayKeyId = getPublicRazorpayKeyId();
      const orderId = (orderData.order_id || orderData.id) as string;
      const RazorpayConstructor = (
        window as unknown as {
          Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckoutInstance;
        }
      ).Razorpay;

      if (!orderData.isMock) {
        if (!razorpayKeyId) {
          throw new Error("Payment gateway is not configured. Use WhatsApp checkout.");
        }
        if (!RazorpayConstructor) {
          throw new Error("Payment gateway is still loading. Please wait a moment and try again.");
        }

        const pendingRes = await fetch("/api/razorpay/pending", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingOrder),
        });
        if (!pendingRes.ok) {
          const pendingErr = await pendingRes.json();
          throw new Error(pendingErr.error || "Could not save order before payment");
        }

        const options = {
          key: razorpayKeyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Morya Luxe Supply",
          description: `Wholesale Supply - ${validatedDetails.salonName}`,
          image: "/images/icon.svg",
          order_id: orderId,
          handler: async function (response: Record<string, string>) {
            try {
              await completeVerifiedOrder(pendingOrder, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: pendingOrder,
              });
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Verification failed";
              setErrorMessage(msg);
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setErrorMessage("Payment cancelled. You can retry or use WhatsApp checkout.");
              setIsProcessing(false);
            },
          },
          prefill: {
            name: validatedDetails.fullName,
            contact: validatedDetails.phone,
            ...(validatedDetails.email ? { email: validatedDetails.email } : {}),
          },
          theme: { color: "#D4AF37" },
        };

        const rzp = new RazorpayConstructor(options);
        rzp.on("payment.failed", (response: RazorpayFailureResponse) => {
          const reason =
            response.error?.description ||
            response.error?.reason ||
            "Payment failed. Please try again or use WhatsApp checkout.";
          setErrorMessage(reason);
          setIsProcessing(false);
        });
        rzp.open();
      } else if (isDemoModeEnabled()) {
        await completeVerifiedOrder(pendingOrder, {
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          orderDetails: pendingOrder,
          isDemo: true,
        });
        setIsProcessing(false);
      } else {
        throw new Error("Online payment is not configured. Use WhatsApp checkout.");
      }
    } catch (err: unknown) {
      console.error("Razorpay Error:", err);
      const msg = err instanceof Error ? err.message : "Failed to initiate payment";
      setErrorMessage(msg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div
        className="slide-in-right cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#0e1017",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <ShoppingBag size={22} color="var(--gold-400)" />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Wholesale Cart</h2>
            <span
              style={{
                fontSize: "0.8rem",
                background: "rgba(212, 175, 55, 0.15)",
                color: "var(--gold-400)",
                padding: "2px 8px",
                borderRadius: "12px",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {formatItemCount(cartItemCount)}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              minWidth: 44,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close cart drawer"
          >
            <X size={22} />
          </button>
        </div>

        {orderSuccess ? (
          <div
            style={{
              padding: "40px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "18px",
              margin: "auto 0",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: isDemoOrder
                  ? "rgba(212, 175, 55, 0.15)"
                  : "rgba(16, 185, 129, 0.15)",
                border: `2px solid ${isDemoOrder ? "var(--gold-400)" : "var(--emerald-400)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2
                size={40}
                color={isDemoOrder ? "var(--gold-400)" : "var(--emerald-400)"}
              />
            </div>

            <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>
              {isDemoOrder ? "Demo Order Recorded!" : "Order Placed Successfully!"}
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Order Reference: <strong style={{ color: "var(--gold-400)" }}>#{orderSuccess.id}</strong>
              <br />
              {isDemoOrder ? (
                <>
                  This is a <strong>demo checkout</strong> — no payment was captured.
                  Configure live Razorpay keys for production payments.
                </>
              ) : (
                <>
                  Confirmation sent for salon <strong>{orderSuccess.customerDetails.salonName}</strong>.
                  Our wholesale dispatch desk is packing your order.
                </>
              )}
            </p>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                width: "100%",
                textAlign: "left",
                fontSize: "0.85rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", gap: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>
                  {isDemoOrder ? "Demo Total:" : "Total Paid / Billed:"}
                </span>
                <span style={{ fontWeight: 800, color: "var(--gold-400)" }}>
                  ₹{orderSuccess.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Delivery Target:</span>
                <span>48 - 72 Hours (Express Surface)</span>
              </div>
            </div>

            <a
              href={whatsappUrl(
                `Hi Morya Luxe Supply, I placed order #${orderSuccess.id}. Please send GST Invoice.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ width: "100%" }}
            >
              <MessageCircle size={18} />
              <span>Track / Inquire via WhatsApp</span>
            </a>

            <button
              onClick={() => {
                setOrderSuccess(null);
                setIsDemoOrder(false);
                setIsCartOpen(false);
              }}
              className="btn btn-secondary-outline"
              style={{ width: "100%" }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                padding: "12px 24px",
                background: "rgba(212, 175, 55, 0.05)",
                borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
                fontSize: "0.8rem",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", gap: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                  <Info size={14} color="var(--gold-400)" style={{ flexShrink: 0 }} />
                  {amountNeededForFreeShipping === 0 ? (
                    <strong style={{ color: "var(--emerald-400)" }}>
                      Unlocked FREE Express Courier!
                    </strong>
                  ) : (
                    <span>
                      Add <strong style={{ color: "var(--gold-400)" }}>₹{amountNeededForFreeShipping.toLocaleString("en-IN")}</strong> more for FREE Pan-India Shipping
                    </span>
                  )}
                </span>
                <span style={{ fontWeight: 700, flexShrink: 0 }}>{Math.round(progressPercent)}%</span>
              </div>
              <div
                style={{
                  height: "5px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progressPercent}%`,
                    background: "var(--gold-gradient)",
                    transition: "width 300ms ease",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {cart.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 0",
                    color: "var(--text-muted)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <ShoppingBag size={48} strokeWidth={1.2} />
                  <p style={{ fontSize: "1rem" }}>Your wholesale cart is empty.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="btn btn-secondary-outline"
                    style={{ marginTop: "12px" }}
                  >
                    Browse Wholesale Gear
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "var(--gold-400)", letterSpacing: "0.05em" }}>
                      Wholesale Items:
                    </div>

                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        style={{
                          display: "flex",
                          gap: "14px",
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-md)",
                          padding: "12px",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "64px",
                            height: "64px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            flexShrink: 0,
                            background: "#08090d",
                          }}
                        >
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: 700,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              color: "#fff",
                            }}
                          >
                            {item.product.name}
                          </h4>
                          <div style={{ fontSize: "0.8rem", color: "var(--gold-400)", fontWeight: 700 }}>
                            ₹{item.activeTierPrice.toLocaleString("en-IN")}{" "}
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>/ unit</span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "6px",
                                background: "rgba(255, 255, 255, 0.05)",
                              }}
                            >
                              <button
                                className="qty-btn"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              >
                                -
                              </button>
                              <span style={{ fontSize: "0.85rem", fontWeight: 700, minWidth: "22px", textAlign: "center" }}>
                                {item.quantity}
                              </span>
                              <button
                                className="qty-btn"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                padding: "8px",
                                minWidth: 44,
                                minHeight: 44,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontWeight: 800,
                              color: "#fff",
                              fontSize: "0.95rem",
                            }}
                          >
                            ₹{item.subtotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(212, 175, 55, 0.2)",
                      borderRadius: "var(--radius-md)",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--gold-300)", fontWeight: 800, fontSize: "0.88rem" }}>
                      <Info size={16} />
                      <span>Salon Delivery &amp; GST Details:</span>
                    </div>

                    {errorMessage && (
                      <div
                        role="alert"
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          color: "#fca5a5",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                        }}
                      >
                        {errorMessage}
                      </div>
                    )}

                    <div className="form-grid-2col">
                      <div>
                        <label htmlFor="cart-fullName" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                          Owner / Barber Name *
                        </label>
                        <input
                          id="cart-fullName"
                          type="text"
                          required
                          value={customerDetails.fullName}
                          onChange={(e) => {
                            clearFieldError("fullName");
                            setCustomerDetails({ ...customerDetails, fullName: e.target.value });
                          }}
                          placeholder="e.g. Ramesh Sharma"
                          style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            outline: "none",
                            minHeight: 44,
                          }}
                        />
                        {fieldErrors.fullName && (
                          <span style={fieldErrorStyle}>{fieldErrors.fullName}</span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="cart-salonName" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                          Salon / Shop Name *
                        </label>
                        <input
                          id="cart-salonName"
                          type="text"
                          required
                          value={customerDetails.salonName}
                          onChange={(e) => {
                            clearFieldError("salonName");
                            setCustomerDetails({ ...customerDetails, salonName: e.target.value });
                          }}
                          placeholder="e.g. Royal Barber Lounge"
                          style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            outline: "none",
                            minHeight: 44,
                          }}
                        />
                        {fieldErrors.salonName && (
                          <span style={fieldErrorStyle}>{fieldErrors.salonName}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-grid-2col">
                      <div>
                        <label htmlFor="cart-phone" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                          Mobile Number *
                        </label>
                        <input
                          id="cart-phone"
                          type="tel"
                          required
                          inputMode="numeric"
                          value={customerDetails.phone}
                          onChange={(e) => {
                            clearFieldError("phone");
                            setCustomerDetails({ ...customerDetails, phone: e.target.value });
                          }}
                          placeholder="10-digit mobile"
                          style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            outline: "none",
                            minHeight: 44,
                          }}
                        />
                        {fieldErrors.phone && (
                          <span style={fieldErrorStyle}>{fieldErrors.phone}</span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="cart-city" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                          City / Town *
                        </label>
                        <input
                          id="cart-city"
                          type="text"
                          required
                          value={customerDetails.city}
                          onChange={(e) => {
                            clearFieldError("city");
                            setCustomerDetails({ ...customerDetails, city: e.target.value });
                          }}
                          placeholder="e.g. Pune / Mumbai"
                          style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            outline: "none",
                            minHeight: 44,
                          }}
                        />
                        {fieldErrors.city && (
                          <span style={fieldErrorStyle}>{fieldErrors.city}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cart-address" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                        Delivery Address *
                      </label>
                      <input
                        id="cart-address"
                        type="text"
                        required
                        value={customerDetails.address}
                        onChange={(e) => {
                          clearFieldError("address");
                          setCustomerDetails({ ...customerDetails, address: e.target.value });
                        }}
                        placeholder="Shop no, street, landmark"
                        style={{
                          width: "100%",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "6px",
                          padding: "10px",
                          color: "#fff",
                          fontSize: "0.85rem",
                          outline: "none",
                          minHeight: 44,
                        }}
                      />
                      {fieldErrors.address && (
                        <span style={fieldErrorStyle}>{fieldErrors.address}</span>
                      )}
                    </div>

                    <div className="form-grid-2col">
                      <div>
                        <label htmlFor="cart-pincode" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                          Pincode *
                        </label>
                        <input
                          id="cart-pincode"
                          type="text"
                          required
                          inputMode="numeric"
                          value={customerDetails.pincode}
                          onChange={(e) => {
                            clearFieldError("pincode");
                            setCustomerDetails({ ...customerDetails, pincode: e.target.value });
                          }}
                          placeholder="6-digit pincode"
                          style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            outline: "none",
                            minHeight: 44,
                          }}
                        />
                        {fieldErrors.pincode && (
                          <span style={fieldErrorStyle}>{fieldErrors.pincode}</span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="cart-gstin" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                          GSTIN (Optional for ITC)
                        </label>
                        <input
                          id="cart-gstin"
                          type="text"
                          value={customerDetails.gstin}
                          onChange={(e) => {
                            clearFieldError("gstin");
                            setCustomerDetails({ ...customerDetails, gstin: e.target.value });
                          }}
                          placeholder="27AAAAA0000A1Z5"
                          style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            outline: "none",
                            minHeight: 44,
                          }}
                        />
                        {fieldErrors.gstin && (
                          <span style={fieldErrorStyle}>{fieldErrors.gstin}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div
                style={{
                  padding: "20px 24px",
                  paddingBottom: "max(20px, env(safe-area-inset-bottom))",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  background: "#0c0d14",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.88rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                    <span>Wholesale Subtotal:</span>
                    <span style={{ color: "#fff", fontFamily: "var(--font-mono)" }}>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {wholesaleSavings > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--emerald-400)", fontWeight: 600 }}>
                      <span>Wholesale Margin Savings:</span>
                      <span>-₹{wholesaleSavings.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                    <span>Pan-India Courier:</span>
                    <span>{subtotal >= 5000 ? <strong style={{ color: "var(--emerald-400)" }}>FREE</strong> : "₹199"}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "1.2rem",
                      fontWeight: 900,
                      paddingTop: "8px",
                      borderTop: "1px solid var(--border-subtle)",
                      marginTop: "4px",
                    }}
                  >
                    <span>Total Amount:</span>
                    <span style={{ color: "var(--gold-300)", fontFamily: "var(--font-mono)" }}>
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    onClick={handleWhatsAppCheckout}
                    disabled={isProcessing}
                    className="btn btn-whatsapp cart-checkout-btn-text"
                    style={{ width: "100%", padding: "14px 20px", fontSize: "0.95rem", opacity: isProcessing ? 0.7 : 1 }}
                    id="cart-whatsapp-checkout-btn"
                  >
                    <MessageCircle size={18} />
                    <span>1-Click Order on WhatsApp ({WHATSAPP_DISPLAY})</span>
                  </button>

                  <button
                    onClick={handleRazorpayCheckout}
                    disabled={isProcessing}
                    className="btn btn-razorpay cart-checkout-btn-text"
                    style={{
                      width: "100%",
                      padding: "13px 20px",
                      fontSize: "0.95rem",
                      opacity: isProcessing ? 0.7 : 1,
                    }}
                    id="cart-razorpay-checkout-btn"
                  >
                    <CreditCard size={18} />
                    <span>{isProcessing ? "Connecting Gateway..." : "Pay Online via Razorpay (UPI / Cards)"}</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
