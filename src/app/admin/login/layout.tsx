import "../admin.css";

export const metadata = {
  title: "Admin Login | Morya Luxe Supply",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>;
}
