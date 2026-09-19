"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Phone,
  MessageCircle,
  Menu,
  X,
  ShieldCheck,
  Truck,
  Sparkles,
  Building2,
} from "lucide-react";
import { whatsappUrl, telUrl, WHATSAPP_DISPLAY } from "@/lib/config";

export default function Navbar({
  searchTerm,
  setSearchTerm,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}) {
  const { totalItemsCount, setIsCartOpen, setIsBulkInquiryOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, width: "100%" }}>
      <div
        style={{
          background: "linear-gradient(90deg, #090a0f 0%, #151824 50%, #090a0f 100%)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
          padding: "6px 16px",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div className="announcement-bar-left">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Truck size={14} color="var(--gold-400)" />
              <span>Pan-India 48hr Courier Dispatch</span>
            </span>
            <span className="desktop-announcement">
              <ShieldCheck size={14} color="var(--emerald-400)" />
              <span>100% Genuine Barber Gear &amp; GST Invoices</span>
            </span>
          </div>

          <div className="announcement-bar-right">
            <span style={{ color: "var(--gold-400)", fontWeight: 600 }}>
              Direct Wholesale Desk:
            </span>
            <a
              href={telUrl()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#fff",
                fontWeight: 700,
                letterSpacing: "0.03em",
                minHeight: 44,
              }}
            >
              <Phone size={13} color="var(--gold-400)" />
              {WHATSAPP_DISPLAY}
            </a>
            <a
              href={whatsappUrl(
                "Hello Morya Luxe Supply, I am a salon owner and need wholesale rates."
              )}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                color: "var(--whatsapp-green)",
                fontWeight: 700,
                minHeight: 44,
              }}
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <nav
        style={{
          background: "rgba(10, 11, 16, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "14px 0",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
            <Image
              src="/images/logo.svg"
              alt="Morya Luxe Supply Logo"
              width={260}
              height={55}
              priority
              className="nav-brand-logo"
              style={{ height: "46px", width: "auto", maxWidth: "min(200px, 45vw)" }}
            />
          </Link>

          <div
            style={{
              flex: "1",
              maxWidth: "420px",
              position: "relative",
            }}
            className="desktop-search"
          >
            <label htmlFor="desktop-search-input" className="sr-only">
              Search products
            </label>
            <input
              id="desktop-search-input"
              type="search"
              placeholder="Search clippers, shears, chairs, pomades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search clippers, shears, chairs, pomades and salon equipment"
              style={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(212, 175, 55, 0.25)",
                borderRadius: "var(--radius-pill)",
                padding: "10px 18px 10px 40px",
                color: "#fff",
                fontSize: "0.9rem",
                outline: "none",
                transition: "all var(--transition-fast)",
                minHeight: 44,
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--gold-400)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(212, 175, 55, 0.25)")}
            />
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--gold-400)",
                pointerEvents: "none",
              }}
            >
              <Sparkles size={16} />
            </span>
          </div>

          <div className="nav-actions-group" style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
            <button
              onClick={() => setIsBulkInquiryOpen(true)}
              className="btn btn-secondary-outline"
              style={{
                padding: "8px 18px",
                fontSize: "0.85rem",
              }}
              id="desktop-bulk-quote-btn"
            >
              <Building2 size={16} color="var(--gold-400)" />
              <span>Salon Setup &amp; Bulk Quote</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="btn btn-primary-gold"
              style={{
                padding: "10px 20px",
                fontSize: "0.9rem",
                position: "relative",
              }}
              id="header-cart-btn"
              aria-label={`Open wholesale cart${totalItemsCount > 0 ? `, ${totalItemsCount} items` : ""}`}
            >
              <ShoppingBag size={18} />
              <span className="navbar-cart-label" style={{ fontWeight: 800 }}>
                Wholesale Cart
              </span>
              {totalItemsCount > 0 && (
                <span
                  style={{
                    background: "#07080b",
                    color: "var(--gold-400)",
                    borderRadius: "50%",
                    minWidth: "22px",
                    height: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.78rem",
                    fontWeight: 900,
                    marginLeft: "4px",
                    border: "1px solid var(--gold-400)",
                  }}
                  aria-hidden="true"
                >
                  {totalItemsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: "transparent",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                color: "#fff",
                padding: "8px",
                cursor: "pointer",
                minWidth: 44,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="mobile-toggle"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div className="mobile-search-wrapper" style={{ padding: "12px 20px 2px" }}>
          <label htmlFor="mobile-search-input" className="sr-only">
            Search products
          </label>
          <input
            id="mobile-search-input"
            type="search"
            placeholder="Search barber tools &amp; equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search barber tools and equipment"
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              borderRadius: "var(--radius-pill)",
              padding: "10px 16px",
              color: "#fff",
              fontSize: "0.9rem",
              outline: "none",
              minHeight: 44,
            }}
          />
        </div>

        {mobileMenuOpen && (
          <div
            style={{
              background: "var(--bg-card)",
              borderBottom: "1px solid var(--border-gold)",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <button
              onClick={() => {
                setIsBulkInquiryOpen(true);
                setMobileMenuOpen(false);
              }}
              className="btn btn-secondary-outline"
              style={{ width: "100%", justifyContent: "flex-start" }}
            >
              <Building2 size={18} color="var(--gold-400)" />
              <span>Salon Setup &amp; Bulk Quote</span>
            </button>
            <a
              href={telUrl()}
              className="btn btn-secondary-outline"
              style={{ width: "100%", justifyContent: "flex-start" }}
            >
              <Phone size={18} color="var(--gold-400)" />
              <span>Call Direct: {WHATSAPP_DISPLAY}</span>
            </a>
            <a
              href={whatsappUrl(
                "Hello Morya Luxe Supply, I am interested in wholesale orders."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ width: "100%" }}
            >
              <MessageCircle size={18} />
              <span>Chat on WhatsApp ({WHATSAPP_DISPLAY})</span>
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
