"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { X, Building2, MessageCircle, CheckCircle, Sparkles } from "lucide-react";
import { BulkInquiryLead } from "@/types";
import { submitBulkInquiry } from "@/lib/supabase";

export default function BulkInquiryModal() {
  const { isBulkInquiryOpen, setIsBulkInquiryOpen } = useCart();
  const [formData, setFormData] = useState<BulkInquiryLead>({
    salonName: "",
    contactPerson: "",
    phone: "",
    email: "",
    city: "",
    state: "Maharashtra",
    requirementType: "new_salon_setup",
    estimatedBudget: "₹1,00,000 - ₹3,00,000",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isBulkInquiryOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await submitBulkInquiry(formData);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleWhatsAppInstantQuote = () => {
    const text = `*NEW B2B SALON SETUP / BULK INQUIRY*
Salon: *${formData.salonName}*
Contact: *${formData.contactPerson}*
Phone: *${formData.phone}*
Location: ${formData.city}, ${formData.state}
Type: ${formData.requirementType.replace(/_/g, " ").toUpperCase()}
Estimated Budget: ${formData.estimatedBudget}
Details: ${formData.message || "Requesting custom quotation catalogue."}`;

    window.open(`https://wa.me/918805589150?text=${encodeURIComponent(text)}`, "_blank");
    setIsBulkInquiryOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsBulkInquiryOpen(false)}>
      <div
        className="glass-panel-gold"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#0d0f18",
          padding: "32px",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={() => setIsBulkInquiryOpen(false)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          <X size={22} />
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", border: "2px solid var(--emerald-400)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={36} color="var(--emerald-400)" />
            </div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Inquiry Received!</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Our Senior B2B Salon Supply Consultant will review your requirements for <strong>{formData.salonName}</strong> and share the master wholesale catalog within 2 hours.
            </p>
            <button
              onClick={handleWhatsAppInstantQuote}
              className="btn btn-whatsapp"
              style={{ width: "100%", padding: "14px" }}
            >
              <MessageCircle size={18} />
              <span>Connect on WhatsApp for Instant Catalog (+91 88055 89150)</span>
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setIsBulkInquiryOpen(false);
              }}
              className="btn btn-secondary-outline"
              style={{ width: "100%" }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--gold-400)", fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>
                <Building2 size={16} />
                <span>Salon Setup &amp; Bulk Crate Desk</span>
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Get Custom Wholesale Quote</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
                Equipping a new salon, academy, or need recurring monthly supplies? Fill out your requirements below:
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Salon / Academy Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.salonName}
                  onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
                  placeholder="e.g. MasterCut Lounge"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Your Name"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Mobile (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit number"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  City, State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Pune, MH"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Requirement Type
                </label>
                <select
                  value={formData.requirementType}
                  onChange={(e: any) => setFormData({ ...formData, requirementType: e.target.value })}
                  style={{ width: "100%", background: "#131622", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none" }}
                >
                  <option value="new_salon_setup">New Salon Setup (Chairs, Stations, Tools)</option>
                  <option value="recurring_monthly_supply">Recurring Monthly Salon Supplies</option>
                  <option value="custom_bulk_order">Wholesale Crate / Master Distribution</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Estimated Budget
                </label>
                <select
                  value={formData.estimatedBudget}
                  onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                  style={{ width: "100%", background: "#131622", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none" }}
                >
                  <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                  <option value="₹50,000 - ₹1,50,000">₹50,000 - ₹1,50,000</option>
                  <option value="₹1,50,000 - ₹3,50,000">₹1,50,000 - ₹3,50,000</option>
                  <option value="₹3,50,000+">₹3,50,000+ (Turnkey Setup)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Equipment or Products Needed
              </label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="List items, brand preferences, or chair quantities needed..."
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none", resize: "none" }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary-gold"
              style={{ width: "100%", padding: "14px" }}
            >
              <Sparkles size={18} />
              <span>{isSubmitting ? "Submitting Inquiry..." : "Submit Wholesale Inquiry"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
