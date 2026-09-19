"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory } from "@/app/admin/actions";

export default function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete category "${name}"? Products using it will keep the old category value.`)) {
      return;
    }
    setLoading(true);
    try {
      await deleteCategory(id);
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
