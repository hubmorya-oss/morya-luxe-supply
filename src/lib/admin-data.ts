import { getSupabaseAdmin } from "@/lib/supabase-server";
import { mapRowToProduct } from "@/lib/product-mapper";
import { Product } from "@/types";
import { CatalogCategory } from "@/lib/categories";

function getDb() {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase not configured");
  return db;
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const db = getDb();
  const { data, error } = await db
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRowToProduct(row));
}

export async function fetchAdminProduct(id: string): Promise<Product | null> {
  const db = getDb();
  const { data, error } = await db.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRowToProduct(data) : null;
}

export async function fetchAdminCategories(): Promise<CatalogCategory[]> {
  const db = getDb();
  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order ?? 0,
  }));
}

export interface AdminOrderRow {
  id: string;
  customerName: string;
  salonName: string;
  phone: string;
  email: string | null;
  city: string;
  state: string;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export async function fetchAdminOrders(): Promise<AdminOrderRow[]> {
  const db = getDb();
  const { data, error } = await db
    .from("orders")
    .select("id, customer_name, salon_name, phone, email, city, state, grand_total, payment_method, payment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    salonName: row.salon_name,
    phone: row.phone,
    email: row.email,
    city: row.city,
    state: row.state,
    grandTotal: Number(row.grand_total),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
  }));
}

export interface AdminInquiryRow {
  id: string;
  salonName: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  city: string;
  state: string;
  requirementType: string;
  estimatedBudget: string | null;
  message: string | null;
  status: string;
  createdAt: string;
}

export async function fetchAdminInquiries(): Promise<AdminInquiryRow[]> {
  const db = getDb();
  const { data, error } = await db
    .from("bulk_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    salonName: row.salon_name,
    contactPerson: row.contact_person,
    phone: row.phone,
    email: row.email,
    city: row.city,
    state: row.state,
    requirementType: row.requirement_type,
    estimatedBudget: row.estimated_budget,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function fetchAdminStats() {
  const db = getDb();
  const [products, orders, inquiries] = await Promise.all([
    db.from("products").select("id", { count: "exact", head: true }),
    db.from("orders").select("id", { count: "exact", head: true }),
    db.from("bulk_inquiries").select("id", { count: "exact", head: true }),
  ]);

  return {
    productCount: products.count ?? 0,
    orderCount: orders.count ?? 0,
    inquiryCount: inquiries.count ?? 0,
  };
}
