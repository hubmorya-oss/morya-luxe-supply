import { fetchAdminOrders, AdminOrderRow } from "@/lib/admin-data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminOrdersPage() {
  let orders: AdminOrderRow[] = [];
  let error = "";

  try {
    orders = await fetchAdminOrders();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load orders";
  }

  return (
    <>
      <div className="admin-header">
        <h1>Orders</h1>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Read-only · latest 200
        </span>
      </div>

      {error && <div className="admin-error" style={{ marginBottom: "16px" }}>{error}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Salon</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <code style={{ fontSize: "0.75rem" }}>{o.id.slice(0, 12)}…</code>
                  </td>
                  <td>{o.customerName}</td>
                  <td>{o.salonName}</td>
                  <td>{o.phone}</td>
                  <td>{o.city}, {o.state}</td>
                  <td>₹{o.grandTotal.toLocaleString("en-IN")}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${o.paymentStatus === "paid" ? "paid" : "pending"}`}>
                      {o.paymentStatus}
                    </span>
                    <br />
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{o.paymentMethod}</span>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDate(o.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
