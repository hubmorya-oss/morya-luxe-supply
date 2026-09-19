import { fetchAdminCategories } from "@/lib/admin-data";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await fetchAdminCategories();

  return (
    <>
      <div className="admin-header">
        <h1>Add Product</h1>
      </div>
      <ProductForm categories={categories} />
    </>
  );
}
