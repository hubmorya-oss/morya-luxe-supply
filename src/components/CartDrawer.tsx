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
  Building2,
  MapPin,
  FileSpreadsheet,
  CheckCircle,
  Truck,
  ArrowRight,
} from "lucide-react";
import { Order } from "@/types";
import { saveOrder } from "@/lib/supabase";

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
  const [errorMessage, setErrorMessage] = useState("");

  if (!isCartOpen) return null;

  // Free shipping threshold ₹5,000
  const freeShippingThreshold = 5000;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Validate form details
  const validateForm = () => {
    if (!customerDetails.fullName.trim()) return "Please enter your name";
    if (!customerDetails.salonName.trim()) return "Please enter your salon / barbershop name";
    if (!customerDetails.phone.trim() || customerDetails.phone.trim().length < 10)
      return "Please enter a valid 10-digit mobile number";
    if (!customerDetails.address.trim()) return "Please enter delivery address";
    if (!customerDetails.city.trim()) return "Please enter your city";
    if (!customerDetails.pincode.trim()) return "Please enter your pincode";
    return null;
  };

  // 1-Click WhatsApp B2B Checkout
  const handleWhatsAppCheckout = async () => {
    const error = validateForm();
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage("");

    const orderId = `MLS-WA-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderId,
      customerDetails,
      items: cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        unitPrice: c.activeTierPrice,
        quantity: c.quantity,
        subtotal: c.subtotal,
      })),
      subtotal,
      wholesaleSavings,
      shipping: subtotal >= 5000 ? 0 : 199,
      gstAmount: Math.round(subtotal * 0.18),
      grandTotal,
      paymentMethod: "whatsapp",
      paymentStatus: "cod_requested",
      createdAt: new Date().toISOString(),
    };

    await saveOrder(newOrder);

    // Format WhatsApp message
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
Salon: *${customerDetails.salonName}*
Owner: *${customerDetails.fullName}*
Phone: *${customerDetails.phone}*
Address: ${customerDetails.address}, ${customerDetails.city} - ${customerDetails.pincode}
${customerDetails.gstin ? `GSTIN: ${customerDetails.gstin}\n` : ""}
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

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/918805589150?text=${encoded}`, "_blank");

    setOrderSuccess(newOrder);
    clearCart();
  };

  // Razorpay Online Payment Checkout
  const handleRazorpayCheckout = async () => {
    const error = validateForm();
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage("");
    setIsProcessing(true);

    try {
      // 1. Create order on server
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
        customerDetails,
        items: cart.map((c) => ({
          productId: c.product.id,
          productName: c.product.name,
          unitPrice: c.activeTierPrice,
          quantity: c.quantity,
          subtotal: c.subtotal,
        })),
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

      // Check if window.Razorpay SDK is loaded
      if (typeof window !== "undefined" && (window as any).Razorpay && !orderData.isMock) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Morya Luxe Supply",
          description: `Wholesale Supply - ${customerDetails.salonName}`,
          image: "/images/icon.svg",
          order_id: orderData.id,
          handler: async function (response: any) {
            // Verify payment
            await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: pendingOrder,
              }),
            });

            setOrderSuccess({
              ...pendingOrder,
              paymentStatus: "paid",
              razorpayPaymentId: response.razorpay_payment_id,
            });
            clearCart();
            setIsProcessing(false);
          },
          prefill: {
            name: customerDetails.fullName,
            contact: customerDetails.phone,
            email: customerDetails.email || "barber@moryaluxesupply.com",
          },
          theme: {
            color: "#D4AF37",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Mock / Demo mode (triggers when testing without live secret keys)
        setTimeout(async () => {
          const completed = {
            ...pendingOrder,
            paymentStatus: "paid" as const,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
          };
          await saveOrder(completed);
          setOrderSuccess(completed);
          clearCart();
          setIsProcessing(false);
        }, 1200);
      }
    } catch (err: any) {
      console.error("Razorpay Error:", err);
      setErrorMessage(err.message || "Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div
        className="slide-in-right"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "520px",
          background: "#0a0b10",
          borderLeft: "1px solid var(--border-gold)",
          display: "flex",
          flexDirection: "column",
          zIndex: 1001,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#0e1017",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              }}
            >
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
            }}
            aria-label="Close cart drawer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Order Success Screen */}
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
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                border: "2px solid var(--emerald-400)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle size={40} color="var(--emerald-400)" />
            </div>

            <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Order Placed Successfully!</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Order Reference: <strong style={{ color: "var(--gold-400)" }}>#{orderSuccess.id}</strong>
              <br />
              Confirmation sent for salon <strong>{orderSuccess.customerDetails.salonName}</strong>.
              Our wholesale dispatch desk is packing your order.
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
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "var(--text-muted)" }}>Total Paid / Billed:</span>
                <span style={{ fontWeight: 800, color: "var(--gold-400)" }}>
                  ₹{orderSuccess.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Delivery Target:</span>
                <span>48 - 72 Hours (Express Surface)</span>
              </div>
            </div>

            <a
              href={`https://wa.me/918805589150?text=Hi%20Morya%20Luxe%20Supply,%20I%20placed%20order%20%23${orderSuccess.id}.%20Please%20send%20GST%20Invoice.`}
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
            {/* Free Shipping / Bulk Progress Bar */}
            <div
              style={{
                padding: "12px 24px",
                background: "rgba(212, 175, 55, 0.05)",
                borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
                fontSize: "0.8rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Truck size={14} color="var(--gold-400)" />
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
                <span style={{ fontWeight: 700 }}>{Math.round(progressPercent)}%</span>
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

            {/* Scrollable Content: Items & Checkout Form */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
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
                  {/* Cart Items List */}
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
                        {/* Thumbnail */}
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

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              color: "#fff",
                            }}
                          >
                            {item.product.name}
                          </h4>
                          <div style={{ fontSize: "0.8rem", color: "var(--gold-400)", fontWeight: 700 }}>
                            ₹{item.activeTierPrice.toLocaleString("en-IN")}{" "}
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>/ unit</span>
                          </div>

                          {/* Quantity Controls */}
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
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#fff",
                                  padding: "2px 8px",
                                  cursor: "pointer",
                                }}
                              >
                                -
                              </button>
                              <span style={{ fontSize: "0.85rem", fontWeight: 700, minWidth: "22px", textAlign: "center" }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#fff",
                                  padding: "2px 8px",
                                  cursor: "pointer",
                                }}
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
                                padding: "4px",
                              }}
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Line Subtotal */}
                        <div style={{ textAlign: "right" }}>
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

                  {/* Salon Delivery & Billing Form */}
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
                      <Building2 size={16} />
                      <span>Salon Delivery &amp; GST Details:</span>
                    </div>

                    {errorMessage && (
                      <div
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

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                          Owner / Barber Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerDetails.fullName}
                          onChange={(e) => setCustomerDetails({ ...customerDetails, fullName: e.target.value })}
                          placeholder="e.g. Ramesh Sharma"
                          style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                          Salon / Shop Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerDetails.salonName}
                          onChange={(e) => setCustomerDetails({ ...customerDetails, salonName: e.target.value })}
                          placeholder="e.g. Royal Barber Lounge"
                          style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerDetails.phone}
                          onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                          placeholder="10-digit mobile"
                          style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                          City / Town *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerDetails.city}
                          onChange={(e) => setCustomerDetails({ ...customerDetails, city: e.target.value })}
                          placeholder="e.g. Pune / Mumbai"
                          style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                        Delivery Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerDetails.address}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                        placeholder="Shop no, street, landmark"
                        style={{
                          width: "100%",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "6px",
                          padding: "8px 10px",
                          color: "#fff",
                          fontSize: "0.85rem",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                          Pincode *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerDetails.pincode}
                          onChange={(e) => setCustomerDetails({ ...customerDetails, pincode: e.target.value })}
                          placeholder="6-digit pincode"
                          style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                          GSTIN (Optional for ITC)
                        </label>
                        <input
                          type="text"
                          value={customerDetails.gstin}
                          onChange={(e) => setCustomerDetails({ ...customerDetails, gstin: e.target.value })}
                          placeholder="27AAAAA0000A1Z5"
                          style={{
                            width: "100%",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Checkout Actions */}
            {cart.length > 0 && (
              <div
                style={{
                  padding: "20px 24px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  background: "#0c0d14",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* Financial Summary */}
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

                {/* Dual Checkout Action Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* WhatsApp Direct Order */}
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="btn btn-whatsapp"
                    style={{ width: "100%", padding: "14px 20px", fontSize: "0.95rem" }}
                    id="cart-whatsapp-checkout-btn"
                  >
                    <MessageCircle size={18} />
                    <span>1-Click Order on WhatsApp (+91 88055 89150)</span>
                  </button>

                  {/* Razorpay Online Payment */}
                  <button
                    onClick={handleRazorpayCheckout}
                    disabled={isProcessing}
                    className="btn btn-razorpay"
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
