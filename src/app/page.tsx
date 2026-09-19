"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { CartProvider, useCart } from "@/context/CartContext";
import { ProductCategory, Product } from "@/types";
import { getProducts } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustFeatures from "@/components/TrustFeatures";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import MarginCalculator from "@/components/MarginCalculator";
import CartDrawer from "@/components/CartDrawer";
import BulkInquiryModal from "@/components/BulkInquiryModal";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Footer from "@/components/Footer";
import {
  Scissors,
  Sparkles,
  Search,
  ArrowUpDown,
  Building2,
} from "lucide-react";
import { whatsappUrl, WHATSAPP_DISPLAY } from "@/lib/config";

function MainAppContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "margin" | "rating">("featured");

  const { setIsBulkInquiryOpen } = useCart();
  const catalogRef = useRef<HTMLElement>(null);

  // Load products on mount
  useEffect(() => {
    async function loadData() {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const scrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to catalog when user starts searching
  useEffect(() => {
    if (searchTerm.trim() && catalogRef.current) {
      const rect = catalogRef.current.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) {
        scrollToCatalog();
      }
    }
  }, [searchTerm]);

  const categories: { id: ProductCategory; label: string }[] = [
    { id: "all", label: "All Wholesale Gear" },
    { id: "clippers-trimmers", label: "Clippers & Trimmers" },
    { id: "shears-scissors", label: "Shears & Scissors" },
    { id: "chairs-furniture", label: "Chairs & Furniture" },
    { id: "haircare-styling", label: "Haircare & Styling" },
    { id: "beard-shaving", label: "Beard & Shaving" },
    { id: "sanitization-hygiene", label: "Sanitization & Hygiene" },
  ];

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.wholesalePrice - b.wholesalePrice);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.wholesalePrice - a.wholesalePrice);
    } else if (sortBy === "margin") {
      result.sort(
        (a, b) =>
          (b.retailMrp - b.wholesalePrice) / b.retailMrp -
          (a.retailMrp - a.wholesalePrice) / a.retailMrp
      );
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, searchTerm, sortBy]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation Header */}
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Hero Banner Section */}
      <Hero onExploreClick={scrollToCatalog} />

      {/* Trust & Wholesale Pillars */}
      <TrustFeatures />

      {/* Main Interactive Product Catalog Section */}
      <section
        id="catalog"
        ref={catalogRef}
        style={{
          padding: "72px 0 88px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="container">
          {/* Section Heading */}
          <div className="catalog-header" style={{ marginBottom: "36px" }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--gold-400)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "8px",
                }}
              >
                <Scissors size={14} />
                <span>Commercial Salon Supplies</span>
              </div>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 900 }}>
                Wholesale Product Catalog
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "4px" }}>
                Select quantity tiers for direct volume discounts. GST Invoicing available at checkout.
              </p>
            </div>

            {/* Sort Controls */}
            <div className="catalog-sort-row" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                <ArrowUpDown size={15} /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as "featured" | "margin" | "price-asc" | "price-desc" | "rating")}
                style={{
                  background: "#131622",
                  border: "1px solid var(--border-gold)",
                  borderRadius: "var(--radius-pill)",
                  padding: "8px 16px",
                  color: "#fff",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="featured">Featured Wholesale</option>
                <option value="margin">Highest Salon Margin %</option>
                <option value="price-asc">Wholesale: Low to High</option>
                <option value="price-desc">Wholesale: High to Low</option>
                <option value="rating">Top Barber Rated</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              paddingBottom: "12px",
              marginBottom: "36px",
              scrollbarWidth: "none",
            }}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    background: isActive ? "var(--gold-gradient)" : "rgba(255, 255, 255, 0.04)",
                    color: isActive ? "#07080b" : "var(--text-secondary)",
                    border: isActive ? "none" : "1px solid var(--border-subtle)",
                    fontWeight: isActive ? 800 : 600,
                    fontSize: "0.85rem",
                    padding: "9px 18px",
                    borderRadius: "var(--radius-pill)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-secondary)" }}>
              <Sparkles size={32} className="animate-float" color="var(--gold-400)" />
              <p style={{ marginTop: "12px" }}>Loading verified wholesale barber products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "var(--radius-lg)",
                border: "1px dashed var(--border-subtle)",
              }}
            >
              <Search size={40} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>No products matched your search.</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "6px" }}>
                Try searching for another keyword or reset your category filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="btn btn-secondary-outline"
                style={{ marginTop: "16px" }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Salon Profit & Margin Calculator */}
      <MarginCalculator />

      {/* High-Volume Salon Setup Banner CTA */}
      <section style={{ padding: "64px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="container">
          <div
            className="glass-panel salon-setup-banner"
            style={{
              background: "linear-gradient(135deg, rgba(21, 24, 38, 0.95) 0%, rgba(10, 11, 16, 0.98) 100%)",
              border: "1px solid var(--border-gold)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <div style={{ maxWidth: "680px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--gold-400)",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                <Building2 size={18} />
                <span>Turnkey Barber &amp; Salon Setup Solutions</span>
              </div>
              <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, marginBottom: "12px" }}>
                Opening a New Salon or Upgrading Chairs?
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                Get turnkey wholesale packages for 2, 4, 8, or 12-chair barbershops. Includes hydraulic chairs,
                shampoo basins, master Japanese steel shears, sterilizers, and 3 months of backbar consumables at
                exclusive setup crate pricing with door delivery.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={() => setIsBulkInquiryOpen(true)}
                className="btn btn-primary-gold"
                style={{ padding: "16px 32px", fontSize: "1rem" }}
              >
                <span>Request Salon Setup Quote</span>
              </button>

              <a
                href={whatsappUrl(
                  "Hello Morya Luxe Supply, I am opening a new salon and need a full equipment quote."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ padding: "14px 28px", fontSize: "0.95rem" }}
              >
                <span>Chat Direct ({WHATSAPP_DISPLAY})</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Modals and Overlays */}
      <ProductModal />
      <CartDrawer />
      <BulkInquiryModal />
      <FloatingWhatsApp />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <CartProvider>
      <MainAppContent />
    </CartProvider>
  );
}
