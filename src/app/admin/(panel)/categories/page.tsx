import { fetchAdminCategories } from "@/lib/admin-data";
import CategoriesManager from "@/components/admin/CategoriesManager";
import { CatalogCategory } from "@/lib/categories";

export default async function AdminCategoriesPage() {
  let categories: CatalogCategory[] = [];
  let error = "";

  try {
    categories = await fetchAdminCategories();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load categories";
  }

  return (
    <>
      {error && <div className="admin-error" style={{ marginBottom: "16px" }}>{error}</div>}
      <CategoriesManager categories={categories} />
    </>
  );
}
