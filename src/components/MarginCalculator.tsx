"use client";

import React, { useState } from "react";
import { Calculator, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";

export default function MarginCalculator() {
  const [chairsCount, setChairsCount] = useState(3);
  const [dailyClientsPerChair, setDailyClientsPerChair] = useState(10);
  const [monthlyRetailBottles, setMonthlyRetailBottles] = useState(25);

  // Typical local distributor markup vs Morya Wholesale
  const monthlyClients = chairsCount * dailyClientsPerChair * 26; // 26 working days
  const distributorChemicalCostPerClient = 45; // average backbar styling/wash cost
  const moryaChemicalCostPerClient = 18; // bulk tub wholesale cost
  const backbarMonthlySavings = monthlyClients * (distributorChemicalCostPerClient - moryaChemicalCostPerClient);

  // Retail resale profit (e.g. Amber Beard Oil / Pomades bought @ ₹200 sold @ ₹499)
  const retailProfitPerBottle = 299;
  const monthlyRetailProfit = monthlyRetailBottles * retailProfitPerBottle;

  const totalMonthlyBenefit = backbarMonthlySavings + monthlyRetailProfit;
  const totalAnnualBenefit = totalMonthlyBenefit * 12;

  return (
    <section style={{ padding: "72px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
      <div className="container">
        <div
          className="glass-panel-gold"
          style={{
            padding: "40px",
            background: "linear-gradient(135deg, rgba(14, 16, 23, 0.95) 0%, rgba(20, 24, 38, 0.95) 100%)",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 36px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 16px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(212, 175, 55, 0.12)",
                border: "1px solid var(--border-gold)",
                color: "var(--gold-300)",
                fontSize: "0.8rem",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              <Calculator size={14} />
              <span>B2B Salon Profit Estimator</span>
            </div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 900, marginBottom: "12px" }}>
              Calculate Your <span className="gold-gradient-text">Wholesale Margin Uplift</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              See how much your barbershop saves every month by bypassing local middlemen and sourcing directly at Morya Luxe Supply wholesale tiers.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "32px",
              alignItems: "center",
            }}
          >
            {/* Input Sliders */}
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              {/* Slider 1: Salon Barber Stations */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                  <span style={{ fontWeight: 600 }}>Active Barber Chairs / Stations:</span>
                  <span style={{ color: "var(--gold-400)", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                    {chairsCount} Chairs
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={chairsCount}
                  onChange={(e) => setChairsCount(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--gold-400)", cursor: "pointer" }}
                />
              </div>

              {/* Slider 2: Daily Clients per Station */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                  <span style={{ fontWeight: 600 }}>Average Clients Per Chair Daily:</span>
                  <span style={{ color: "var(--gold-400)", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                    {dailyClientsPerChair} Clients
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="30"
                  value={dailyClientsPerChair}
                  onChange={(e) => setDailyClientsPerChair(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--gold-400)", cursor: "pointer" }}
                />
              </div>

              {/* Slider 3: Retail Resale Bottles */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                  <span style={{ fontWeight: 600 }}>Retail Resale Items Sold Per Month (Oils, Pomades):</span>
                  <span style={{ color: "var(--gold-400)", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                    {monthlyRetailBottles} Units
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={monthlyRetailBottles}
                  onChange={(e) => setMonthlyRetailBottles(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--gold-400)", cursor: "pointer" }}
                />
              </div>
            </div>

            {/* Live Benefit Breakdown Cards */}
            <div
              style={{
                background: "rgba(10, 11, 16, 0.8)",
                border: "1px solid var(--border-gold)",
                borderRadius: "var(--radius-lg)",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--emerald-400)", fontWeight: 700 }}>
                <TrendingUp size={20} />
                <span>Estimated Monthly Net Financial Advantage:</span>
              </div>

              <div
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  fontWeight: 900,
                  color: "#fff",
                  fontFamily: "var(--font-mono)",
                  lineHeight: 1,
                }}
              >
                ₹{totalMonthlyBenefit.toLocaleString("en-IN")}
                <span style={{ fontSize: "1rem", color: "var(--text-secondary)", fontWeight: 500 }}> / month</span>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Backbar Supply Savings ({monthlyClients.toLocaleString("en-IN")} services):</span>
                  <span style={{ fontWeight: 700, color: "var(--gold-400)" }}>+₹{backbarMonthlySavings.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Retail Resale Profit (Counter Sales):</span>
                  <span style={{ fontWeight: 700, color: "var(--emerald-400)" }}>+₹{monthlyRetailProfit.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px dashed var(--border-subtle)" }}>
                  <span style={{ fontWeight: 700, color: "#fff" }}>Annual Cumulative Salon Profit:</span>
                  <span style={{ fontWeight: 800, color: "var(--gold-300)", fontFamily: "var(--font-mono)" }}>
                    ₹{totalAnnualBenefit.toLocaleString("en-IN")} / year
                  </span>
                </div>
              </div>

              <a
                href="https://wa.me/918805589150?text=Hello%20Morya%20Luxe%20Supply,%20I%20used%20your%20Wholesale%20Calculator%20and%20want%20to%20place%20a%20recurring%20supply%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ width: "100%", marginTop: "8px" }}
              >
                <span>Lock In Your Wholesale Tier via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
