"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product, PricingTier } from "@/types";
import { createProduct, updateProduct, ProductFormInput } from "@/app/admin/actions";
import { CatalogCategory } from "@/lib/categories";

interface ProductFormProps {
  product?: Product;
  categories: CatalogCategory[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function calcSavingsPercent(retailMrp: number, unitPrice: number): number {
  if (retailMrp <= 0) return 0;
  return Math.max(0, Math.round((1 - unitPrice / retailMrp) * 100));
}

type SpecRow = { key: string; value: string };

function specsToRows(specs: Record<string, string>): SpecRow[] {
  const rows = Object.entries(specs).map(([key, value]) => ({ key, value }));
  return rows.length > 0 ? rows : [{ key: "", value: "" }];
}

function rowsToSpecs(rows: SpecRow[]): Record<string, string> {
  const specs: Record<string, string> = {};
  for (const row of rows) {
    const key = row.key.trim();
    const value = row.value.trim();
    if (key && value) specs[key] = value;
  }
  return specs;
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<ProductFormInput>({
    id: product?.id ?? "",
    slug: product?.slug ?? "",
    name: product?.name ?? "",
    brand: product?.brand ?? "",
    category: product?.category ?? categories[0]?.id ?? "",
    categoryName: product?.categoryName ?? categories[0]?.name ?? "",
    description: product?.description ?? "",
    retailMrp: product?.retailMrp ?? 0,
    wholesalePrice: product?.wholesalePrice ?? 0,
    moq: product?.moq ?? 1,
    tierPricing: product?.tierPricing ?? [],
    inStock: product?.inStock ?? true,
    stockCount: product?.stockCount ?? 0,
    rating: product?.rating ?? 5,
    reviewsCount: product?.reviewsCount ?? 0,
    badge: product?.badge ?? "",
    imageUrl: product?.imageUrl ?? "",
    features: product?.features ?? [],
    specs: product?.specs ?? {},
  });

  const [tiers, setTiers] = useState<PricingTier[]>(product?.tierPricing ?? []);
  const [featuresText, setFeaturesText] = useState(
    (product?.features ?? []).join("\n")
  );
  const [specRows, setSpecRows] = useState<SpecRow[]>(
    specsToRows(product?.specs ?? {})
  );

  function updateField<K extends keyof ProductFormInput>(key: K, value: ProductFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCategoryChange(categoryId: string) {
    const cat = categories.find((c) => c.id === categoryId);
    updateField("category", categoryId);
    if (cat) updateField("categoryName", cat.name);
  }

  function updateTier(index: number, patch: Partial<PricingTier>) {
    setTiers((prev) =>
      prev.map((tier, i) => (i === index ? { ...tier, ...patch } : tier))
    );
  }

  function addTier() {
    setTiers((prev) => [
      ...prev,
      {
        minQty: prev.length === 0 ? 1 : (prev[prev.length - 1]?.minQty ?? 1) + 5,
        unitPrice: form.wholesalePrice,
        label: "",
        savingsPercent: calcSavingsPercent(form.retailMrp, form.wholesalePrice),
      },
    ]);
  }

  function removeTier(index: number) {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSpecRow(index: number, patch: Partial<SpecRow>) {
    setSpecRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function addSpecRow() {
    setSpecRows((prev) => [...prev, { key: "", value: "" }]);
  }

  function removeSpecRow(index: number) {
    setSpecRows((prev) => (prev.length <= 1 ? [{ key: "", value: "" }] : prev.filter((_, i) => i !== index)));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      updateField("imageUrl", data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const tierPricing = tiers
        .filter((tier) => tier.minQty >= 1 && tier.unitPrice >= 0)
        .map((tier) => ({
          ...tier,
          label: tier.label.trim() || `Buy ${tier.minQty}+ units`,
          savingsPercent: calcSavingsPercent(form.retailMrp, tier.unitPrice),
        }))
        .sort((a, b) => a.minQty - b.minQty);

      const payload: ProductFormInput = {
        ...form,
        id: form.id || slugify(form.name),
        slug: form.slug || slugify(form.name),
        tierPricing,
        features: featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
        specs: rowsToSpecs(specRows),
      };

      if (isEdit) {
        await updateProduct(payload);
      } else {
        await createProduct(payload);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {error && <div className="admin-error">{error}</div>}

      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="name">Product Name *</label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(e) => {
              updateField("name", e.target.value);
              if (!isEdit && !form.slug) {
                updateField("slug", slugify(e.target.value));
                updateField("id", slugify(e.target.value));
              }
            }}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="slug">Slug *</label>
          <input
            id="slug"
            required
            value={form.slug}
            onChange={(e) => {
              updateField("slug", e.target.value);
              if (!isEdit) updateField("id", e.target.value);
            }}
          />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="brand">Brand *</label>
          <input
            id="brand"
            required
            value={form.brand}
            onChange={(e) => updateField("brand", e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            required
            value={form.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </div>

      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="retailMrp">Retail MRP (₹) *</label>
          <input
            id="retailMrp"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.retailMrp}
            onChange={(e) => updateField("retailMrp", Number(e.target.value))}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="wholesalePrice">Wholesale Price (₹) *</label>
          <input
            id="wholesalePrice"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.wholesalePrice}
            onChange={(e) => updateField("wholesalePrice", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="moq">MOQ</label>
          <input
            id="moq"
            type="number"
            min="1"
            value={form.moq}
            onChange={(e) => updateField("moq", Number(e.target.value))}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="stockCount">Stock Count</label>
          <input
            id="stockCount"
            type="number"
            min="0"
            value={form.stockCount}
            onChange={(e) => updateField("stockCount", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="rating">Rating</label>
          <input
            id="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={form.rating}
            onChange={(e) => updateField("rating", Number(e.target.value))}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="reviewsCount">Reviews Count</label>
          <input
            id="reviewsCount"
            type="number"
            min="0"
            value={form.reviewsCount}
            onChange={(e) => updateField("reviewsCount", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="badge">Badge</label>
          <input
            id="badge"
            value={form.badge}
            onChange={(e) => updateField("badge", e.target.value)}
            placeholder="Best Seller"
          />
        </div>
        <div className="admin-field">
          <label>
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) => updateField("inStock", e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            In Stock
          </label>
        </div>
      </div>

      <div className="admin-field">
        <label htmlFor="imageUrl">Image URL *</label>
        <input
          id="imageUrl"
          required
          value={form.imageUrl}
          onChange={(e) => updateField("imageUrl", e.target.value)}
          placeholder="/images/product.jpg or Supabase URL"
        />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          style={{ marginTop: "8px", fontSize: "0.85rem" }}
          disabled={uploading}
        />
        {uploading && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Uploading...
          </p>
        )}
      </div>

      <div className="admin-field">
        <label htmlFor="features">Features (one per line)</label>
        <textarea id="features" value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} />
      </div>

      <div className="admin-field">
        <label>Bulk price tiers (optional)</label>
        <p className="admin-field-hint">
          Leave empty to use wholesale price only. Add tiers for volume discounts (e.g. buy 5+ at lower price).
        </p>
        {tiers.length === 0 ? (
          <p className="admin-field-hint">No bulk tiers — wholesale price applies for all quantities.</p>
        ) : (
          <div className="admin-repeat-list">
            {tiers.map((tier, index) => (
              <div key={index} className="admin-repeat-row">
                <div className="admin-form-row">
                  <div className="admin-field">
                    <label>Min quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={tier.minQty}
                      onChange={(e) => updateTier(index, { minQty: Number(e.target.value) })}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Price per unit (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tier.unitPrice}
                      onChange={(e) =>
                        updateTier(index, { unitPrice: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="admin-field">
                  <label>Label (shown on product page)</label>
                  <input
                    value={tier.label}
                    onChange={(e) => updateTier(index, { label: e.target.value })}
                    placeholder={`Salon Pack (${tier.minQty}+ units)`}
                  />
                </div>
                <button
                  type="button"
                  className="admin-btn-danger"
                  onClick={() => removeTier(index)}
                >
                  Remove tier
                </button>
              </div>
            ))}
          </div>
        )}
        <button type="button" className="btn btn-secondary-outline admin-add-row-btn" onClick={addTier}>
          + Add bulk price tier
        </button>
      </div>

      <div className="admin-field">
        <label>Product specifications</label>
        <p className="admin-field-hint">
          Details like motor type, warranty, material — shown in the product popup.
        </p>
        <div className="admin-repeat-list">
          {specRows.map((row, index) => (
            <div key={index} className="admin-repeat-row">
              <div className="admin-form-row">
                <div className="admin-field">
                  <label>Name</label>
                  <input
                    value={row.key}
                    onChange={(e) => updateSpecRow(index, { key: e.target.value })}
                    placeholder="Warranty"
                  />
                </div>
                <div className="admin-field">
                  <label>Detail</label>
                  <input
                    value={row.value}
                    onChange={(e) => updateSpecRow(index, { value: e.target.value })}
                    placeholder="1 Year Commercial"
                  />
                </div>
              </div>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={() => removeSpecRow(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-secondary-outline admin-add-row-btn" onClick={addSpecRow}>
          + Add specification
        </button>
      </div>

      <div className="admin-actions">
        <button type="submit" className="btn btn-primary-gold" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </button>
        <button
          type="button"
          className="btn btn-secondary-outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
