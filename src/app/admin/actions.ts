"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { mapProductToRow } from "@/lib/product-mapper";
import { PricingTier } from "@/types";

async function assertAdmin() {
  const { user } = await getAdminSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

function getAdminDb() {
  const db = getSupabaseAdmin();
  if (!db) {
    throw new Error("Supabase admin client not configured");
  }
  return db;
}

export interface ProductFormInput {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  description: string;
  retailMrp: number;
  wholesalePrice: number;
  moq: number;
  tierPricing: PricingTier[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewsCount: number;
  badge: string;
  imageUrl: string;
  features: string[];
  specs: Record<string, string>;
}

export async function createProduct(input: ProductFormInput) {
  await assertAdmin();
  const db = getAdminDb();

  const { error } = await db.from("products").insert([mapProductToRow(input)]);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function updateProduct(input: ProductFormInput) {
  await assertAdmin();
  const db = getAdminDb();

  const { error } = await db
    .from("products")
    .update(mapProductToRow(input))
    .eq("id", input.id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProduct(id: string) {
  await assertAdmin();
  const db = getAdminDb();

  const { error } = await db.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export interface CategoryFormInput {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
}

export async function createCategory(input: CategoryFormInput) {
  await assertAdmin();
  const db = getAdminDb();

  const { error } = await db.from("categories").insert([
    {
      id: input.id,
      slug: input.slug,
      name: input.name,
      sort_order: input.sortOrder,
    },
  ]);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function updateCategory(input: CategoryFormInput) {
  await assertAdmin();
  const db = getAdminDb();

  const { error } = await db
    .from("categories")
    .update({
      slug: input.slug,
      name: input.name,
      sort_order: input.sortOrder,
    })
    .eq("id", input.id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string) {
  await assertAdmin();
  const db = getAdminDb();

  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function signOutAdmin() {
  const { supabase } = await getAdminSession();
  await supabase.auth.signOut();
}

export async function loginAdmin(email: string, password: string) {
  const supabase = (await import("@/lib/supabase/server")).createSupabaseServerClient();
  const client = await supabase;

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    return { success: false, error: error.message };
  }

  const {
    data: { user },
  } = await client.auth.getUser();

  const { isAdminEmail } = await import("@/lib/admin-auth");
  if (!isAdminEmail(user?.email)) {
    await client.auth.signOut();
    return { success: false, error: "This account is not authorized for admin access." };
  }

  return { success: true };
}
