"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { X, Building2, MessageCircle, CheckCircle, Sparkles } from "lucide-react";
import { BulkInquiryLead } from "@/types";
import { openWhatsApp, WHATSAPP_DISPLAY } from "@/lib/config";
import {
  FieldErrors,
  INDIAN_PHONE_ERROR,
  validateBulkInquiryLead,
} from "@/lib/validation";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (!isBulkInquiryOpen) return null;

  const fieldErrorStyle: React.CSSProperties = {
    fontSize: "0.72rem",
    color: "#fca5a5",
    marginTop: "4px",
    display: "block",
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateBulkInquiryLead(formData);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      setFieldErrors(validation.fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to submit inquiry. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Inquiry submission error:", err);
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppInstantQuote = () => {
    const validation = validateBulkInquiryLead(formData);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      setFieldErrors(validation.fieldErrors);
      setSubmitted(false);
      return;
    }

    const lead = validation.data;
    const text = `*NEW B2B SALON SETUP / BULK INQUIRY*
Salon: *${lead.salonName}*
Contact: *${lead.contactPerson}*
Phone: *${lead.phone}*
Location: ${lead.city}, ${lead.state}
Type: ${lead.requirementType.replace(/_/g, " ").toUpperCase()}
Estimated Budget: ${lead.estimatedBudget}
Details: ${lead.message || "Requesting custom quotation catalogue."}`;

    openWhatsApp(text);
    setIsBulkInquiryOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsBulkInquiryOpen(false)}>
      <div
        className="glass-panel-gold modal-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0d0f18",
          padding: "32px",
          position: "relative",
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
            minWidth: 44,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Close bulk inquiry dialog"
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
              <span>Connect on WhatsApp for Instant Catalog ({WHATSAPP_DISPLAY})</span>
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

            {errorMessage && (
              <div
                role="alert"
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#fca5a5",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                }}
              >
                {errorMessage}
              </div>
            )}

            <div className="form-grid-2col">
              <div>
                <label htmlFor="inquiry-salonName" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Salon / Academy Name *
                </label>
                <input
                  id="inquiry-salonName"
                  type="text"
                  required
                  value={formData.salonName}
                  onChange={(e) => {
                    clearFieldError("salonName");
                    setFormData({ ...formData, salonName: e.target.value });
                  }}
                  placeholder="e.g. MasterCut Lounge"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none", minHeight: 44 }}
                />
                {fieldErrors.salonName && (
                  <span style={fieldErrorStyle}>{fieldErrors.salonName}</span>
                )}
              </div>
              <div>
                <label htmlFor="inquiry-contactPerson" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Contact Person *
                </label>
                <input
                  id="inquiry-contactPerson"
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => {
                    clearFieldError("contactPerson");
                    setFormData({ ...formData, contactPerson: e.target.value });
                  }}
                  placeholder="Your Name"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none", minHeight: 44 }}
                />
                {fieldErrors.contactPerson && (
                  <span style={fieldErrorStyle}>{fieldErrors.contactPerson}</span>
                )}
              </div>
            </div>

            <div className="form-grid-2col">
              <div>
                <label htmlFor="inquiry-phone" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Mobile (WhatsApp) *
                </label>
                <input
                  id="inquiry-phone"
                  type="tel"
                  required
                  inputMode="tel"
                  title={INDIAN_PHONE_ERROR}
                  value={formData.phone}
                  onChange={(e) => {
                    clearFieldError("phone");
                    setFormData({ ...formData, phone: e.target.value });
                  }}
                  placeholder="10-digit number"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none", minHeight: 44 }}
                />
                {fieldErrors.phone && (
                  <span style={fieldErrorStyle}>{fieldErrors.phone}</span>
                )}
              </div>
              <div>
                <label htmlFor="inquiry-city" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  City, State *
                </label>
                <input
                  id="inquiry-city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => {
                    clearFieldError("city");
                    setFormData({ ...formData, city: e.target.value });
                  }}
                  placeholder="e.g. Pune, MH"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none", minHeight: 44 }}
                />
                {fieldErrors.city && (
                  <span style={fieldErrorStyle}>{fieldErrors.city}</span>
                )}
              </div>
            </div>

            <div className="form-grid-2col">
              <div>
                <label htmlFor="inquiry-requirementType" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Requirement Type
                </label>
                <select
                  id="inquiry-requirementType"
                  value={formData.requirementType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    clearFieldError("requirementType");
                    setFormData({
                      ...formData,
                      requirementType: e.target.value as BulkInquiryLead["requirementType"],
                    });
                  }}
                  style={{ width: "100%", background: "#131622", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none", minHeight: 44 }}
                >
                  <option value="new_salon_setup">New Salon Setup (Chairs, Stations, Tools)</option>
                  <option value="recurring_monthly_supply">Recurring Monthly Salon Supplies</option>
                  <option value="custom_bulk_order">Wholesale Crate / Master Distribution</option>
                </select>
                {fieldErrors.requirementType && (
                  <span style={fieldErrorStyle}>{fieldErrors.requirementType}</span>
                )}
              </div>

              <div>
                <label htmlFor="inquiry-budget" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Estimated Budget
                </label>
                <select
                  id="inquiry-budget"
                  value={formData.estimatedBudget}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    clearFieldError("estimatedBudget");
                    setFormData({ ...formData, estimatedBudget: e.target.value });
                  }}
                  style={{ width: "100%", background: "#131622", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none", minHeight: 44 }}
                >
                  <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                  <option value="₹50,000 - ₹1,50,000">₹50,000 - ₹1,50,000</option>
                  <option value="₹1,00,000 - ₹3,00,000">₹1,00,000 - ₹3,00,000</option>
                  <option value="₹1,50,000 - ₹3,50,000">₹1,50,000 - ₹3,50,000</option>
                  <option value="₹3,50,000+">₹3,50,000+ (Turnkey Setup)</option>
                </select>
                {fieldErrors.estimatedBudget && (
                  <span style={fieldErrorStyle}>{fieldErrors.estimatedBudget}</span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="inquiry-message" style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Equipment or Products Needed
              </label>
              <textarea
                id="inquiry-message"
                rows={3}
                value={formData.message}
                onChange={(e) => {
                  clearFieldError("message");
                  setFormData({ ...formData, message: e.target.value });
                }}
                placeholder="List items, brand preferences, or chair quantities needed..."
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "10px", color: "#fff", outline: "none", resize: "vertical", minHeight: 88 }}
              />
              {fieldErrors.message && (
                <span style={fieldErrorStyle}>{fieldErrors.message}</span>
              )}
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
