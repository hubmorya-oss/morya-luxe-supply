"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions";

export default function DeleteProductButton({
  id,
  name,
  redirectTo,
}: {
  id: string;
  name: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await deleteProduct(id);
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="admin-btn-danger"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}
