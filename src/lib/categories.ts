import { ProductCategory } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface CatalogCategory {
  id: ProductCategory | string;
  slug: string;
  name: string;
  sortOrder: number;
}

const DEFAULT_CATEGORIES: CatalogCategory[] = [
  { id: "clippers-trimmers", slug: "clippers-trimmers", name: "Clippers & Trimmers", sortOrder: 1 },
  { id: "shears-scissors", slug: "shears-scissors", name: "Shears & Scissors", sortOrder: 2 },
  { id: "chairs-furniture", slug: "chairs-furniture", name: "Chairs & Furniture", sortOrder: 3 },
  { id: "haircare-styling", slug: "haircare-styling", name: "Haircare & Styling", sortOrder: 4 },
  { id: "beard-shaving", slug: "beard-shaving", name: "Beard & Shaving", sortOrder: 5 },
  { id: "sanitization-hygiene", slug: "sanitization-hygiene", name: "Sanitization & Hygiene", sortOrder: 6 },
];

export async function getCategories(): Promise<CatalogCategory[]> {
  if (!isSupabaseConfigured || !supabase) {
    return DEFAULT_CATEGORIES;
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_CATEGORIES;
    }

    return data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      sortOrder: row.sort_order ?? 0,
    }));
  } catch {
    return DEFAULT_CATEGORIES;
  }
}
