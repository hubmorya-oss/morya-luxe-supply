"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, OrderCustomerDetails } from "@/types";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  wholesaleSavings: number;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isBulkInquiryOpen: boolean;
  setIsBulkInquiryOpen: (open: boolean) => void;
  customerDetails: OrderCustomerDetails;
  setCustomerDetails: React.Dispatch<React.SetStateAction<OrderCustomerDetails>>;
  calculateUnitTierPrice: (product: Product, qty: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isBulkInquiryOpen, setIsBulkInquiryOpen] = useState(false);

  const [customerDetails, setCustomerDetails] = useState<OrderCustomerDetails>({
    fullName: "",
    salonName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
    gstin: "",
    orderNotes: "",
  });

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("morya_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.warn("Could not load cart from localStorage", e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("morya_cart", JSON.stringify(cart));
    } catch (e) {
      console.warn("Could not persist cart", e);
    }
  }, [cart]);

  // Function to calculate unit price based on tiered bulk pricing
  const calculateUnitTierPrice = (product: Product, qty: number): number => {
    if (!product.tierPricing || product.tierPricing.length === 0) {
      return product.wholesalePrice;
    }

    // Sort descending by minQty
    const sortedTiers = [...product.tierPricing].sort((a, b) => b.minQty - a.minQty);
    for (const tier of sortedTiers) {
      if (qty >= tier.minQty) {
        return tier.unitPrice;
      }
    }
    return product.wholesalePrice;
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const newQty = prevCart[existingIndex].quantity + quantity;
        const tierPrice = calculateUnitTierPrice(product, newQty);
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          activeTierPrice: tierPrice,
          subtotal: tierPrice * newQty,
        };
        return updated;
      } else {
        const initialQty = Math.max(quantity, product.moq || 1);
        const tierPrice = calculateUnitTierPrice(product, initialQty);
        return [
          ...prevCart,
          {
            product,
            quantity: initialQty,
            activeTierPrice: tierPrice,
            subtotal: tierPrice * initialQty,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const validQty = Math.max(quantity, item.product.moq || 1);
          const tierPrice = calculateUnitTierPrice(item.product, validQty);
          return {
            ...item,
            quantity: validQty,
            activeTierPrice: tierPrice,
            subtotal: tierPrice * validQty,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const subtotal = cart.reduce((total, item) => total + item.subtotal, 0);

  // Compute how much the customer saved compared to Retail MRP
  const totalRetailMrp = cart.reduce(
    (total, item) => total + item.product.retailMrp * item.quantity,
    0
  );
  const wholesaleSavings = Math.max(0, totalRetailMrp - subtotal);

  // Shipping is FREE for orders above ₹5,000, otherwise flat ₹199
  const shipping = subtotal >= 5000 || subtotal === 0 ? 0 : 199;
  const grandTotal = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        subtotal,
        wholesaleSavings,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
        quickViewProduct,
        setQuickViewProduct,
        isBulkInquiryOpen,
        setIsBulkInquiryOpen,
        customerDetails,
        setCustomerDetails,
        calculateUnitTierPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
