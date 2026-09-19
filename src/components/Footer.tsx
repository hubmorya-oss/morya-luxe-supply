import React from "react";
import Image from "next/image";
// Removed Link
import { Phone, MessageCircle, MapPin, ShieldCheck, FileSpreadsheet } from "lucide-react";
import { whatsappUrl, telUrl, WHATSAPP_DISPLAY } from "@/lib/config";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#06070a",
        borderTop: "1px solid rgba(212, 175, 55, 0.2)",
        paddingTop: "64px",
        paddingBottom: "32px",
        color: "var(--text-secondary)",
        fontSize: "0.88rem",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "40px",
            marginBottom: "56px",
          }}
        >
          {/* Col 1: Brand Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Image
              src="/images/logo.svg"
              alt="Morya Luxe Supply"
              width={240}
              height={52}
              style={{ height: "42px", width: "auto" }}
            />
            <p style={{ lineHeight: 1.6, color: "var(--text-secondary)" }}>
              Empowering professional barbers, hairstylists, and luxury salon chains across India
              with authentic factory-direct equipment, Japanese steel shears, and certified wholesale grooming supplies.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={16} color="var(--gold-400)" />
                <span>Authorized Wholesale Distributor</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileSpreadsheet size={16} color="var(--gold-400)" />
                <span>100% GST Invoiced Billing</span>
              </div>
            </div>
          </div>

          {/* Col 2: Wholesale Categories */}
          <div>
            <h4
              style={{
                color: "#fff",
                fontSize: "0.95rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "18px",
                fontFamily: "var(--font-sans)",
              }}
            >
              Wholesale Gear
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              <li>
                <a href="#catalog" style={{ color: "inherit", textDecoration: "none" }}>
                  Clippers, Trimmers &amp; Shavers
                </a>
              </li>
              <li>
                <a href="#catalog" style={{ color: "inherit", textDecoration: "none" }}>
                  Japanese Damascus Shears
                </a>
              </li>
              <li>
                <a href="#catalog" style={{ color: "inherit", textDecoration: "none" }}>
                  Heavy-Duty Hydraulic Chairs
                </a>
              </li>
              <li>
                <a href="#catalog" style={{ color: "inherit", textDecoration: "none" }}>
                  Ceramic Wash Stations
                </a>
              </li>
              <li>
                <a href="#catalog" style={{ color: "inherit", textDecoration: "none" }}>
                  UV Sterilizers &amp; Barbicide Jars
                </a>
              </li>
              <li>
                <a href="#catalog" style={{ color: "inherit", textDecoration: "none" }}>
                  Backbar Bulk Pomades &amp; Elixirs
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Salon B2B Policies */}
          <div>
            <h4
              style={{
                color: "#fff",
                fontSize: "0.95rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "18px",
                fontFamily: "var(--font-sans)",
              }}
            >
              B2B Assurance
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              <li>Minimum Order Quantity (MOQ) Friendly</li>
              <li>Pan-India Express Surface &amp; Air Logistics</li>
              <li>1 to 2 Years Commercial Motor Warranty</li>
              <li>Free Transit Insurance on Heavy Furniture</li>
              <li>Cash On Delivery (COD) on Select Routes</li>
              <li>GST Input Credit Invoices</li>
            </ul>
          </div>

          {/* Col 4: Contact & Direct Desk */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h4
              style={{
                color: "#fff",
                fontSize: "0.95rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "4px",
                fontFamily: "var(--font-sans)",
              }}
            >
              Wholesale Ordering Desk
            </h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Reach out directly for custom crate quotes, salon franchise setups, or urgent dispatches:
            </p>

            <a
              href={telUrl()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.05rem",
                textDecoration: "none",
              }}
            >
              <Phone size={18} color="var(--gold-400)" />
              <span>{WHATSAPP_DISPLAY}</span>
            </a>

            <a
              href={whatsappUrl(
                "Hello Morya Luxe Supply, I am a salon owner and need wholesale rates."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ padding: "10px 18px", width: "fit-content", fontSize: "0.88rem" }}
            >
              <MessageCircle size={16} />
              <span>WhatsApp Direct Desk</span>
            </a>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
              <MapPin size={16} color="var(--gold-400)" />
              <span>Logistics Hubs: Mumbai • Pune • Delhi</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div
          className="footer-bottom"
          style={{
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} <strong>Morya Luxe Supply</strong>. All rights reserved. B2B Wholesale Barber Supply Network.
          </div>
          <div>
            Authorized B2B Trade Platform • Powered by Vercel Edge &amp; Supabase
          </div>
        </div>
      </div>
    </footer>
  );
}
