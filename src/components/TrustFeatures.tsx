import React from "react";
import { DollarSign, Truck, ShieldCheck, FileSpreadsheet } from "lucide-react";

export default function TrustFeatures() {
  const features = [
    {
      icon: <DollarSign size={28} color="var(--gold-400)" />,
      title: "Direct Factory Wholesale",
      description: "Cut out middlemen distributors. Access genuine factory rates and keep up to 65% higher margins on salon equipment.",
    },
    {
      icon: <FileSpreadsheet size={28} color="var(--gold-400)" />,
      title: "GST Invoicing & Input Credit",
      description: "Receive compliant B2B tax invoices with every shipment. Claim your full GST input tax credit for salon business write-offs.",
    },
    {
      icon: <Truck size={28} color="var(--gold-400)" />,
      title: "Pan-India Express Courier",
      description: "Dispatched from regional logistics hubs across Mumbai, Delhi, and Bengaluru within 24 to 48 hours with door delivery.",
    },
    {
      icon: <ShieldCheck size={28} color="var(--gold-400)" />,
      title: "100% Certified Salon Grade",
      description: "Every clipper, shear, and hydraulic chair undergoes rigorous QC testing and is backed by official commercial warranties.",
    },
  ];

  return (
    <section style={{ padding: "64px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "24px",
          }}
        >
          {features.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                transition: "all var(--transition-base)",
              }}
            >
              <div
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "14px",
                  background: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>{item.title}</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
