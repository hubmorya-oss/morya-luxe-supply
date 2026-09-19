"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutAdmin } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`admin-nav-link${active ? " active" : ""}${className ? ` ${className}` : ""}`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export default function AdminNav({ email }: { email: string }) {
  const router = useRouter();

  async function handleSignOut() {
    await signOutAdmin();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <aside className="admin-sidebar">
        <div className="admin-brand">Morya Admin</div>
        <NavLinks />
        <div style={{ marginTop: "auto", padding: "16px 8px 0" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px" }}>
            {email}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="btn btn-secondary-outline"
            style={{ width: "100%", fontSize: "0.85rem", padding: "8px" }}
          >
            Sign Out
          </button>
        </div>
      </aside>
      <nav className="admin-mobile-nav">
        <NavLinks />
      </nav>
    </>
  );
}
