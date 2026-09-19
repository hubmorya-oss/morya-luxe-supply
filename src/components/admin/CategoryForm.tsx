"use client";

import { useState } from "react";
import { createCategory, updateCategory, CategoryFormInput } from "@/app/admin/actions";
import { CatalogCategory } from "@/lib/categories";

interface CategoryFormProps {
  category?: CatalogCategory;
  onDone: () => void;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CategoryForm({ category, onDone }: CategoryFormProps) {
  const isEdit = Boolean(category);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CategoryFormInput>({
    id: category?.id ?? "",
    slug: category?.slug ?? "",
    name: category?.name ?? "",
    sortOrder: category?.sortOrder ?? 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        id: form.id || slugify(form.name),
        slug: form.slug || slugify(form.name),
      };

      if (isEdit) {
        await updateCategory(payload);
      } else {
        await createCategory(payload);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} style={{ maxWidth: "480px" }}>
      {error && <div className="admin-error">{error}</div>}

      <div className="admin-field">
        <label htmlFor="cat-name">Name *</label>
        <input
          id="cat-name"
          required
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            setForm((prev) => ({
              ...prev,
              name,
              ...(!isEdit ? { id: slugify(name), slug: slugify(name) } : {}),
            }));
          }}
        />
      </div>

      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="cat-id">ID *</label>
          <input
            id="cat-id"
            required
            value={form.id}
            disabled={isEdit}
            onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="cat-slug">Slug *</label>
          <input
            id="cat-slug"
            required
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
          />
        </div>
      </div>

      <div className="admin-field">
        <label htmlFor="cat-sort">Sort Order</label>
        <input
          id="cat-sort"
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
        />
      </div>

      <div className="admin-actions">
        <button type="submit" className="btn btn-primary-gold" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
        <button type="button" className="btn btn-secondary-outline" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
