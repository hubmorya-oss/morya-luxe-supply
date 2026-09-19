"use client";

import { useState } from "react";
import { CatalogCategory } from "@/lib/categories";
import CategoryForm from "@/components/admin/CategoryForm";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";

export default function CategoriesManager({ categories }: { categories: CatalogCategory[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CatalogCategory | null>(null);

  function handleDone() {
    setShowForm(false);
    setEditing(null);
    window.location.reload();
  }

  return (
    <>
      <div className="admin-header">
        <h1>Categories</h1>
        {!showForm && !editing && (
          <button
            type="button"
            className="btn btn-primary-gold"
            style={{ fontSize: "0.85rem" }}
            onClick={() => setShowForm(true)}
          >
            Add Category
          </button>
        )}
      </div>

      {(showForm || editing) && (
        <div className="admin-card" style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "16px" }}>
            {editing ? "Edit Category" : "New Category"}
          </h2>
          <CategoryForm category={editing ?? undefined} onDone={handleDone} />
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>ID / Slug</th>
              <th>Sort</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.name}</td>
                <td>
                  <code style={{ fontSize: "0.8rem" }}>{cat.id}</code>
                </td>
                <td>{cat.sortOrder}</td>
                <td style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="admin-link"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    onClick={() => {
                      setShowForm(false);
                      setEditing(cat);
                    }}
                  >
                    Edit
                  </button>
                  <DeleteCategoryButton id={cat.id} name={cat.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
