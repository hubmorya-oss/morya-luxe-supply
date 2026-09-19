import { fetchAdminInquiries, AdminInquiryRow } from "@/lib/admin-data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminInquiriesPage() {
  let inquiries: AdminInquiryRow[] = [];
  let error = "";

  try {
    inquiries = await fetchAdminInquiries();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load inquiries";
  }

  return (
    <>
      <div className="admin-header">
        <h1>Bulk Inquiries</h1>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Read-only · latest 200
        </span>
      </div>

      {error && <div className="admin-error" style={{ marginBottom: "16px" }}>{error}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Salon</th>
              <th>Contact</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Type</th>
              <th>Budget</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                  No inquiries yet.
                </td>
              </tr>
            ) : (
              inquiries.map((inq) => (
                <tr key={inq.id}>
                  <td>
                    <strong>{inq.salonName}</strong>
                    {inq.message && (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", maxWidth: "200px" }}>
                        {inq.message.slice(0, 80)}{inq.message.length > 80 ? "…" : ""}
                      </p>
                    )}
                  </td>
                  <td>{inq.contactPerson}</td>
                  <td>{inq.phone}</td>
                  <td>{inq.city}, {inq.state}</td>
                  <td style={{ fontSize: "0.8rem" }}>{inq.requirementType.replace(/_/g, " ")}</td>
                  <td>{inq.estimatedBudget || "—"}</td>
                  <td>
                    <span className="admin-badge admin-badge-pending">{inq.status}</span>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDate(inq.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
