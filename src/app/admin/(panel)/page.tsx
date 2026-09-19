import Link from "next/link";
import { fetchAdminStats } from "@/lib/admin-data";
import { isSupabaseAdminConfigured } from "@/lib/supabase-server";

export default async function AdminDashboardPage() {
  let stats = { productCount: 0, orderCount: 0, inquiryCount: 0 };
  let error = "";

  if (isSupabaseAdminConfigured()) {
    try {
      stats = await fetchAdminStats();
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load stats";
    }
  } else {
    error = "Supabase service role not configured";
  }

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
      </div>

      {error && <div className="admin-error" style={{ marginBottom: "16px" }}>{error}</div>}

      <div className="admin-stats">
        <Link href="/admin/products" className="admin-stat" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="admin-stat-value">{stats.productCount}</div>
          <div className="admin-stat-label">Products</div>
        </Link>
        <Link href="/admin/orders" className="admin-stat" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="admin-stat-value">{stats.orderCount}</div>
          <div className="admin-stat-label">Orders</div>
        </Link>
        <Link href="/admin/inquiries" className="admin-stat" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="admin-stat-value">{stats.inquiryCount}</div>
          <div className="admin-stat-label">Bulk Inquiries</div>
        </Link>
      </div>

      <div className="admin-card" style={{ marginTop: "24px" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "12px" }}>Quick Actions</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <Link href="/admin/products/new" className="btn btn-primary-gold" style={{ fontSize: "0.85rem" }}>
            Add Product
          </Link>
          <Link href="/admin/categories" className="btn btn-secondary-outline" style={{ fontSize: "0.85rem" }}>
            Manage Categories
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-link" style={{ alignSelf: "center" }}>
            View Live Site →
          </a>
        </div>
      </div>
    </>
  );
}
