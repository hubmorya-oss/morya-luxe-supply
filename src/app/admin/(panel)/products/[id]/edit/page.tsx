import { notFound } from "next/navigation";
import { fetchAdminProduct, fetchAdminCategories } from "@/lib/admin-data";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    fetchAdminProduct(id),
    fetchAdminCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <>
      <div className="admin-header">
        <h1>Edit Product</h1>
      </div>
      <ProductForm product={product} categories={categories} />
    </>
  );
}
