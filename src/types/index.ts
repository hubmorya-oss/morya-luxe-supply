export type ProductCategory =
  | "all"
  | "clippers-trimmers"
  | "shears-scissors"
  | "chairs-furniture"
  | "haircare-styling"
  | "beard-shaving"
  | "sanitization-hygiene";

export interface PricingTier {
  minQty: number;
  unitPrice: number;
  label: string; // e.g. "Salon 6-Pack (Save 20%)"
  savingsPercent: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  categoryName: string;
  description: string;
  retailMrp: number; // Suggested Resale / Salon Price (INR)
  wholesalePrice: number; // Base Wholesale Price (INR)
  moq: number; // Minimum Order Quantity
  tierPricing: PricingTier[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewsCount: number;
  badge?: string; // e.g. "Top Wholesale Seller", "Salon Essential"
  imageUrl: string;
  features: string[];
  specs: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  activeTierPrice: number;
  subtotal: number;
}

export interface OrderCustomerDetails {
  fullName: string;
  salonName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  orderNotes?: string;
}

export interface Order {
  id: string;
  customerDetails: OrderCustomerDetails;
  items: Array<{
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
  subtotal: number;
  wholesaleSavings: number;
  shipping: number;
  gstAmount: number;
  grandTotal: number;
  paymentMethod: "razorpay" | "whatsapp";
  paymentStatus: "pending" | "paid" | "cod_requested";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export interface BulkInquiryLead {
  salonName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  requirementType: "new_salon_setup" | "recurring_monthly_supply" | "custom_bulk_order";
  estimatedBudget: string;
  message: string;
}
