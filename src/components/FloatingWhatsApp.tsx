"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { whatsappUrl, WHATSAPP_DISPLAY } from "@/lib/config";

export default function FloatingWhatsApp() {
  return (
    <aside className="floating-whatsapp" aria-label="Direct WhatsApp Ordering Support">
      <a
        href={whatsappUrl(
          "Hello Morya Luxe Supply, I am a salon owner and need quick assistance with wholesale rates."
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-link"
        id="floating-whatsapp-widget"
        aria-label={`Chat directly on WhatsApp at ${WHATSAPP_DISPLAY}`}
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
            aria-hidden="true"
          />
        </span>
        <div className="floating-whatsapp-text" style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.15 }}>
          <span style={{ fontSize: "0.72rem", opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Wholesale Hotline
          </span>
          <span style={{ fontWeight: 800 }}>{WHATSAPP_DISPLAY}</span>
        </div>
      </a>
    </aside>
  );
}
