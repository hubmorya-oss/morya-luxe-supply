"use client";

import React from "react";
import Image from "next/image";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Eye, Star, Tag, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/config";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, setQuickViewProduct } = useCart();

  const marginPercent = Math.round(
    ((product.retailMrp - product.wholesalePrice) / product.retailMrp) * 100
  );

  return (
    <div
      className="glass-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        transition: "transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "var(--border-gold-bright)";
        e.currentTarget.style.boxShadow = "var(--shadow-gold-sm)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
    >
      {/* Product Image Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1/1",
          background: "#08090d",
          overflow: "hidden",
          cursor: "pointer",
        }}
        onClick={() => setQuickViewProduct(product)}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{
            objectFit: "cover",
            transition: "transform 400ms ease",
          }}
        />

        {/* Badges Overlay */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            zIndex: 2,
          }}
        >
          {product.badge && (
            <span className="badge-pill badge-gold">
              <Star size={10} fill="currentColor" />
              {product.badge}
            </span>
          )}
          <span className="badge-pill badge-emerald">
            <Tag size={10} />
            {marginPercent}% Salon Margin
          </span>
        </div>

        {/* Quick View Hover Trigger */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(7, 8, 11, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity var(--transition-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <button
            className="btn btn-secondary-outline"
            style={{
              padding: "8px 16px",
              fontSize: "0.85rem",
              background: "rgba(10, 11, 16, 0.85)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
          >
            <Eye size={16} />
            <span>View Specifications</span>
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-between",
          gap: "14px",
        }}
      >
        <div>
          {/* Brand & Category */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <span>{product.brand}</span>
            <span style={{ color: "var(--gold-400)" }}>MOQ: {product.moq} Unit{product.moq > 1 ? "s" : ""}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => setQuickViewProduct(product)}
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              lineHeight: 1.4,
              color: "#fff",
              cursor: "pointer",
              marginBottom: "8px",
            }}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", color: "var(--gold-400)" }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                />
              ))}
            </div>
            <span style={{ fontWeight: 600, color: "#fff" }}>{product.rating}</span>
            <span>({product.reviewsCount} barber reviews)</span>
          </div>

          {/* Pricing Block */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "var(--radius-md)",
              padding: "10px 14px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: "var(--gold-300)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ₹{product.wholesalePrice.toLocaleString("en-IN")}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Wholesale / unit
              </span>
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  textDecoration: "line-through",
                  marginLeft: "auto",
                }}
              >
                MRP ₹{product.retailMrp.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Wholesale Tier Hint */}
            {product.tierPricing && product.tierPricing.length > 1 && (
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "0.76rem",
                  color: "var(--emerald-400)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>Bulk Tier:</span>
                <span>
                  Buy {product.tierPricing[1].minQty}+ @ ₹
                  {product.tierPricing[1].unitPrice.toLocaleString("en-IN")}/unit
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={() => addToCart(product, 1)}
            className="btn btn-primary-gold"
            style={{
              width: "100%",
              padding: "11px 16px",
              fontSize: "0.9rem",
            }}
            id={`add-to-cart-${product.id}`}
          >
            <ShoppingBag size={16} />
            <span>Add to Wholesale Cart</span>
          </button>

          <a
            href={whatsappUrl(
              `Hello Morya Luxe Supply, I want wholesale rates for: ${product.name} (Wholesale: ₹${product.wholesalePrice})`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary-outline"
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: "0.82rem",
              gap: "6px",
            }}
          >
            <MessageCircle size={15} color="var(--whatsapp-green)" />
            <span>WhatsApp Quick Quote</span>
          </a>
        </div>
      </div>
    </div>
  );
}
