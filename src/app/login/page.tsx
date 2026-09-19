import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="admin-login-page">Loading...</div>}>
      <div className="admin-login-page">
        <div className="admin-login-card">
          <Link href="/" style={{ display: "block", marginBottom: "20px" }}>
            <Image
              src="/images/logo.svg"
              alt="Morya Luxe Supply"
              width={220}
              height={48}
              style={{ height: "40px", width: "auto" }}
            />
          </Link>
          <AdminLoginForm />
        </div>
      </div>
    </Suspense>
  );
}
