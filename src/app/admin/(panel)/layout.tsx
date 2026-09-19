import { requireAdmin } from "@/lib/admin-auth";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <AdminNav email={user.email ?? ""} />
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
