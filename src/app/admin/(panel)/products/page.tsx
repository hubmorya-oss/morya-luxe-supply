import Link from "next/link";
import { fetchAdminProducts } from "@/lib/admin-data";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { Product } from "@/types";

export default async function AdminProductsPage() {
  let products: Product[] = [];
  let error = "";

  try {
    products = await fetchAdminProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load products";
  }

  return (
    <>
      <div className="admin-header">
        <h1>Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary-gold" style={{ fontSize: "0.85rem" }}>
          Add Product
        </Link>
      </div>

      {error && <div className="admin-error" style={{ marginBottom: "16px" }}>{error}</div>}

      <div className="admin-product-cards">
        {products.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "24px 0" }}>
            No products yet. Add your first product.
          </p>
        ) : (
          products.map((p) => (
          <div key={p.id} className="admin-product-card">
            <div>
              <strong>{p.name}</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "4px 0 0" }}>
                {p.brand} · {p.categoryName}
              </p>
              <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>
                ₹{p.wholesalePrice.toLocaleString("en-IN")} · Stock: {p.stockCount} ·{" "}
                {p.inStock ? "In stock" : "Out of stock"}
              </p>
            </div>
            <div className="admin-product-card-actions">
              <Link href={`/admin/products/${p.id}/edit`} className="admin-link">
                Edit
              </Link>
              <DeleteProductButton id={p.id} name={p.name} />
            </div>
          </div>
          ))
        )}
      </div>

      <div className="admin-table-wrap admin-table-wrap-desktop">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Wholesale</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                  No products yet. Add your first product or seed from mock catalog.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <br />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{p.brand}</span>
                  </td>
                  <td>{p.categoryName}</td>
                  <td>₹{p.wholesalePrice.toLocaleString("en-IN")}</td>
                  <td>{p.stockCount}</td>
                  <td>{p.inStock ? "In stock" : "Out of stock"}</td>
                  <td style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <Link href={`/admin/products/${p.id}/edit`} className="admin-link">
                      Edit
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
