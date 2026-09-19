"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import {
  X,
  Star,
  CheckCircle2,
  ShoppingBag,
  MessageCircle,
  Truck,
  FileSpreadsheet,
} from "lucide-react";
import { whatsappUrl } from "@/lib/config";

export default function ProductModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, calculateUnitTierPrice } = useCart();
  const [selectedQty, setSelectedQty] = useState(1);

  if (!quickViewProduct) return null;

  const currentTierPrice = calculateUnitTierPrice(quickViewProduct, selectedQty);
  const totalCost = currentTierPrice * selectedQty;
  const potentialRetailResale = quickViewProduct.retailMrp * selectedQty;
  const totalProfit = potentialRetailResale - totalCost;

  return (
    <div
      className="modal-overlay"
      onClick={() => setQuickViewProduct(null)}
      style={{ zIndex: 1001 }}
    >
      <div
        className="glass-panel-gold modal-panel modal-panel-wide"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0c0e15",
          padding: "28px",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            cursor: "pointer",
            zIndex: 10,
          }}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "28px",
          }}
        >
          {/* Left Column: Product Image */}
          <div>
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: "1px solid var(--border-gold)",
                background: "#08090d",
              }}
            >
              <Image
                src={quickViewProduct.imageUrl}
                alt={quickViewProduct.name}
                fill
                priority
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* B2B Assurance Badges */}
            <div
              style={{
                marginTop: "18px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                fontSize: "0.8rem",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  padding: "10px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Truck size={18} color="var(--gold-400)" />
                <span>Pan-India 48hr Insured Express</span>
              </div>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  padding: "10px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FileSpreadsheet size={18} color="var(--gold-400)" />
                <span>GST Tax Invoice Provided</span>
              </div>
            </div>
          </div>

          {/* Right Column: Specs & Tier Matrix */}
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--gold-400)", fontWeight: 700, textTransform: "uppercase" }}>
              {quickViewProduct.brand} • {quickViewProduct.categoryName}
            </div>

            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, margin: "6px 0 10px", lineHeight: 1.3 }}>
              {quickViewProduct.name}
            </h2>

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", color: "var(--gold-400)" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(quickViewProduct.rating) ? "currentColor" : "none"} />
                ))}
              </div>
              <span style={{ fontWeight: 700 }}>{quickViewProduct.rating} / 5.0</span>
              <span style={{ color: "var(--text-secondary)" }}>({quickViewProduct.reviewsCount} verified salon reviews)</span>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "18px", lineHeight: 1.5 }}>
              {quickViewProduct.description}
            </p>

            {/* Wholesale Tier Pricing Table */}
            <div
              style={{
                background: "rgba(212, 175, 55, 0.06)",
                border: "1px solid var(--border-gold)",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                marginBottom: "18px",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--gold-300)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Wholesale Volume Price Matrix:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {quickViewProduct.tierPricing.map((tier, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.85rem",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: selectedQty >= tier.minQty ? "rgba(212, 175, 55, 0.15)" : "transparent",
                    }}
                  >
                    <span>{tier.label}:</span>
                    <span style={{ fontWeight: 800, color: "var(--gold-400)", fontFamily: "var(--font-mono)" }}>
                      ₹{tier.unitPrice.toLocaleString("en-IN")} / unit
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Resale Profit Calculator */}
            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                marginBottom: "20px",
                fontSize: "0.85rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Selected Quantity:</span>
                <span style={{ fontWeight: 700 }}>{selectedQty} units</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Your Wholesale Cost:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>₹{totalCost.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--emerald-400)", fontWeight: 800 }}>
                <span>Estimated Resale / Salon Margin:</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>+₹{totalProfit.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Key Features Bullet Points */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px" }}>Key Features &amp; Engineering:</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                {quickViewProduct.features.map((feat, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <CheckCircle2 size={16} color="var(--gold-400)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Specifications Grid */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px" }}>Technical Specifications:</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.8rem" }}>
                {Object.entries(quickViewProduct.specs).map(([key, val]) => (
                  <div key={key} style={{ background: "rgba(255, 255, 255, 0.03)", padding: "8px 10px", borderRadius: "6px" }}>
                    <span style={{ color: "var(--text-muted)", display: "block" }}>{key}</span>
                    <span style={{ fontWeight: 600, color: "#fff" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="product-modal-actions">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid var(--border-gold)",
                  borderRadius: "var(--radius-pill)",
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "4px 8px",
                }}
              >
                <button
                  className="qty-btn"
                  onClick={() => setSelectedQty(Math.max(quickViewProduct.moq || 1, selectedQty - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span style={{ fontWeight: 800, minWidth: "30px", textAlign: "center", fontFamily: "var(--font-mono)" }}>
                  {selectedQty}
                </span>
                <button
                  className="qty-btn"
                  onClick={() => setSelectedQty(selectedQty + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  addToCart(quickViewProduct, selectedQty);
                  setQuickViewProduct(null);
                }}
                className="btn btn-primary-gold"
                style={{ flex: 1, padding: "12px 24px" }}
              >
                <ShoppingBag size={18} />
                <span>Add {selectedQty} Units to Cart</span>
              </button>

              <a
                href={whatsappUrl(
                  `Hello Morya Luxe Supply, I want to order ${selectedQty} units of: ${quickViewProduct.name} (Wholesale: ₹${totalCost})`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ padding: "12px 20px" }}
              >
                <MessageCircle size={18} />
                <span>Direct WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
