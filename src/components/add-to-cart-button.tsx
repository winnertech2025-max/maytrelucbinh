"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "./cart-provider";

export function AddToCartButton({ product, label = "Thêm vào giỏ" }: { product: Product; label?: string }) {
  const cart = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1400);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <button
      onClick={() => {
        cart.addItem(product);
        setAdded(true);
      }}
      className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded px-3 text-sm font-bold text-white shadow-sm transition duration-200 active:scale-[0.98] ${
        added ? "bg-[#1f4b2e] ring-4 ring-green-100" : "bg-[#2f6b3f] hover:bg-[#1f4b2e]"
      }`}
    >
      {added ? <Check size={16} /> : <ShoppingCart size={16} />} {added ? "Đã thêm" : label}
    </button>
  );
}
