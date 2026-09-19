import { Suspense } from "react";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="admin-login-page">Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
