"use client";

import React from "react";
import Image from "next/image";
import { MessageCircle, ArrowDown, Sparkles, CheckCircle2 } from "lucide-react";
import { whatsappUrl } from "@/lib/config";

export default function Hero({ onExploreClick }: { onExploreClick: () => void }) {
  return (
    <section
      className="hero-section"
      style={{
        position: "relative",
        minHeight: "85vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
      }}
    >
      {/* Background Image with Dark Vignette Gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
        }}
      >
        <Image
          src="/images/hero-banner.jpg"
          alt="Luxury Barber Wholesale Equipment"
          fill
          priority
          style={{
            objectFit: "cover",
            objectPosition: "center 35%",
            filter: "brightness(0.4) contrast(1.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, rgba(7, 8, 11, 0.6) 0%, rgba(7, 8, 11, 0.95) 85%)",
          }}
        />
      </div>

      {/* Decorative Golden Ambient Lights */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "20%",
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "15%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)",
          filter: "blur(70px)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Hero Content */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 3,
          paddingTop: "60px",
          paddingBottom: "60px",
          textAlign: "center",
          maxWidth: "1000px",
        }}
      >
        {/* Prestige Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(212, 175, 55, 0.12)",
            border: "1px solid rgba(212, 175, 55, 0.4)",
            padding: "8px 20px",
            borderRadius: "var(--radius-pill)",
            marginBottom: "24px",
            boxShadow: "0 0 20px rgba(212, 175, 55, 0.2)",
          }}
        >
          <Sparkles size={16} color="var(--gold-400)" />
          <span
            style={{
              color: "var(--gold-300)",
              fontSize: "0.85rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            India&apos;s Official B2B Barber &amp; Salon Supply Network
          </span>
        </div>

        {/* Master Heading */}
        <h1
          style={{
            fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)",
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: "20px",
            textTransform: "uppercase",
          }}
        >
          Wholesale Barber Gear. <br />
          <span className="gold-gradient-text">Direct Factory Margins.</span> <br />
          Built For Masters.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "var(--text-secondary)",
            maxWidth: "780px",
            margin: "0 auto 36px",
            lineHeight: 1.6,
          }}
        >
          Supply your salon with Japanese Damascus shears, brushless fade clippers, vintage hydraulic
          chairs, and backbar styling essentials at authentic wholesale rates. 100% genuine with GST
          invoicing and Pan-India 48hr dispatch.
        </p>

        {/* Action Buttons */}
        <div
          className="hero-actions"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "48px",
          }}
        >
          <button
            onClick={onExploreClick}
            className="btn btn-primary-gold"
            style={{ padding: "16px 36px", fontSize: "1.05rem" }}
            id="hero-explore-catalog-btn"
          >
            <span>Explore Wholesale Catalog</span>
            <ArrowDown size={18} />
          </button>

          <a
            href={whatsappUrl(
              "Hello Morya Luxe Supply, I am a barber owner and want to place a wholesale order."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            style={{ padding: "16px 32px", fontSize: "1.05rem" }}
            id="hero-whatsapp-btn"
          >
            <MessageCircle size={20} />
            <span>Quick Order via WhatsApp</span>
          </a>
        </div>

        {/* Trust Badges Bar */}
        <div
          className="hero-trust-badges"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            flexWrap: "wrap",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={16} color="var(--gold-400)" />
            <span>Direct Wholesale (No Middlemen)</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={16} color="var(--gold-400)" />
            <span>GST Input Tax Credit Eligible</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={16} color="var(--gold-400)" />
            <span>Salon MOQ Friendly</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={16} color="var(--gold-400)" />
            <span>Cash On Delivery Available</span>
          </span>
        </div>
      </div>
    </section>
  );
}
