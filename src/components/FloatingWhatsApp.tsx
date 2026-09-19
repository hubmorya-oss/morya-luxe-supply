"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
  return (
    <aside
      aria-label="Direct WhatsApp Ordering Support"
      style={{
        position: "fixed",
        bottom: "28px",
        right: "24px",
        zIndex: 990,
      }}
    >
      <a
        href="https://wa.me/918805589150?text=Hello%20Morya%20Luxe%20Supply,%20I%20am%20a%20salon%20owner%20and%20need%20quick%20assistance%20with%20wholesale%20rates."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          color: "#ffffff",
          padding: "12px 20px",
          borderRadius: "var(--radius-pill)",
          boxShadow: "0 8px 30px rgba(37, 211, 102, 0.45)",
          textDecoration: "none",
          fontWeight: 700,
          fontSize: "0.92rem",
          transition: "transform 200ms ease, box-shadow 200ms ease",
          border: "1px solid rgba(255, 255, 255, 0.25)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
          e.currentTarget.style.boxShadow = "0 12px 36px rgba(37, 211, 102, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 30px rgba(37, 211, 102, 0.45)";
        }}
        id="floating-whatsapp-widget"
        aria-label="Chat directly on WhatsApp at +91 88055 89150"
      >
        <span
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MessageCircle size={24} />
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#fff",
            }}
          />
        </span>
        <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.15 }}>
          <span style={{ fontSize: "0.72rem", opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Wholesale Hotline
          </span>
          <span style={{ fontWeight: 800 }}>+91 88055 89150</span>
        </div>
      </a>
    </aside>
  );
}
