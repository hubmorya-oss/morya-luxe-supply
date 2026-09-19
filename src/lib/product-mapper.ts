import { Product, PricingTier } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRowToProduct(item: Record<string, any>): Product {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    brand: item.brand,
    category: item.category,
    categoryName: item.category_name,
    description: item.description ?? "",
    retailMrp: Number(item.retail_mrp),
    wholesalePrice: Number(item.wholesale_price),
    moq: item.moq || 1,
    tierPricing: (item.tier_pricing as PricingTier[]) || [],
    inStock: item.in_stock ?? true,
    stockCount: item.stock_count || 0,
    rating: Number(item.rating) || 5.0,
    reviewsCount: item.reviews_count || 0,
    badge: item.badge ?? undefined,
    imageUrl: item.image_url,
    features: item.features || [],
    specs: item.specs || {},
  };
}

export function mapProductToRow(product: {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  description?: string;
  retailMrp: number;
  wholesalePrice: number;
  moq?: number;
  tierPricing?: PricingTier[];
  inStock?: boolean;
  stockCount?: number;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  imageUrl: string;
  features?: string[];
  specs?: Record<string, string>;
}) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    category_name: product.categoryName,
    description: product.description ?? "",
    retail_mrp: product.retailMrp,
    wholesale_price: product.wholesalePrice,
    moq: product.moq ?? 1,
    tier_pricing: product.tierPricing ?? [],
    in_stock: product.inStock ?? true,
    stock_count: product.stockCount ?? 0,
    rating: product.rating ?? 5.0,
    reviews_count: product.reviewsCount ?? 0,
    badge: product.badge ?? null,
    image_url: product.imageUrl,
    features: product.features ?? [],
    specs: product.specs ?? {},
  };
}
