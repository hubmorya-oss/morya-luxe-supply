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
      {/* B2B Top Announcement Bar */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Truck size={14} color="var(--gold-400)" />
              <span>Pan-India 48hr Courier Dispatch</span>
            </span>
            <span style={{ display: "none" }} className="desktop-announcement">
              <ShieldCheck size={14} color="var(--emerald-400)" />
              <span>100% Genuine Barber Gear &amp; GST Invoices</span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ color: "var(--gold-400)", fontWeight: 600 }}>
              Direct Wholesale Desk:
            </span>
            <a
              href="tel:+918805589150"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#fff",
                fontWeight: 700,
                letterSpacing: "0.03em",
              }}
            >
              <Phone size={13} color="var(--gold-400)" />
              +91 88055 89150
            </a>
            <a
              href="https://wa.me/918805589150?text=Hello%20Morya%20Luxe%20Supply,%20I%20am%20a%20salon%20owner%20and%20need%20wholesale%20rates."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                color: "var(--whatsapp-green)",
                fontWeight: 700,
              }}
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
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
            gap: "20px",
          }}
        >
          {/* Brand Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Image
              src="/images/logo.svg"
              alt="Morya Luxe Supply Logo"
              width={260}
              height={55}
              priority
              style={{ height: "46px", width: "auto" }}
            />
          </Link>

          {/* Desktop Search Bar */}
          <div
            style={{
              flex: "1",
              maxWidth: "420px",
              display: "none",
              position: "relative",
            }}
            className="desktop-search"
          >
            <input
              type="text"
              placeholder="Search clippers, shears, chairs, pomades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Desktop Navigation Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setIsBulkInquiryOpen(true)}
              className="btn btn-secondary-outline"
              style={{
                padding: "8px 18px",
                fontSize: "0.85rem",
                display: "none",
              }}
              id="desktop-bulk-quote-btn"
            >
              <Building2 size={16} color="var(--gold-400)" />
              <span>Salon Setup &amp; Bulk Quote</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn btn-primary-gold"
              style={{
                padding: "10px 20px",
                fontSize: "0.9rem",
                position: "relative",
              }}
              id="header-cart-btn"
              aria-label="Open wholesale cart"
            >
              <ShoppingBag size={18} />
              <span style={{ fontWeight: 800 }}>Wholesale Cart</span>
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
                >
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: "none",
                background: "transparent",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                color: "#fff",
                padding: "8px",
                cursor: "pointer",
              }}
              className="mobile-toggle"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input (Visible on small screens) */}
        <div
          className="mobile-search-wrapper"
          style={{
            display: "none",
            padding: "12px 20px 2px",
          }}
        >
          <input
            type="text"
            placeholder="Search barber tools &amp; equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              borderRadius: "var(--radius-pill)",
              padding: "10px 16px",
              color: "#fff",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>

        {/* Mobile Menu Dropdown */}
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
              href="tel:+918805589150"
              className="btn btn-secondary-outline"
              style={{ width: "100%", justifyContent: "flex-start" }}
            >
              <Phone size={18} color="var(--gold-400)" />
              <span>Call Direct: +91 88055 89150</span>
            </a>
            <a
              href="https://wa.me/918805589150?text=Hello%20Morya%20Luxe%20Supply,%20I%20am%20interested%20in%20wholesale%20orders."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ width: "100%" }}
            >
              <MessageCircle size={18} />
              <span>Chat on WhatsApp (+91 88055 89150)</span>
            </a>
          </div>
        )}
      </nav>

      {/* Inline styles for responsive visibility */}
      <style jsx>{`
        @media (min-width: 900px) {
          .desktop-search {
            display: block !important;
          }
          #desktop-bulk-quote-btn {
            display: inline-flex !important;
          }
          .desktop-announcement {
            display: flex !important;
            align-items: center;
            gap: 6px;
          }
        }
        @media (max-width: 899px) {
          .mobile-search-wrapper {
            display: block !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
