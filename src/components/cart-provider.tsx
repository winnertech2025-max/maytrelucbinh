"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/types";

export type CartItem = {
  slug: string;
  name: string;
  image: string;
  price: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  hydrated: boolean;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clear: () => void;
};

type CartNotice = {
  item: CartItem;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "may-tre-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "vi";
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [notice, setNotice] = useState<CartNotice | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = window.localStorage.getItem(storageKey);
        setItems(raw ? JSON.parse(raw) : []);
      } catch {
        setItems([]);
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [hydrated, items]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  const showNotice = useCallback((item: CartItem, total: number) => {
    setNotice({ item, total });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 4200);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      hydrated,
      addItem(product, quantity = 1) {
        const nextItem = {
          slug: product.slug,
          name: product.name,
          image: product.image,
          price: product.salePrice || product.price,
          quantity,
        };
        setItems((current) => {
          const existing = current.find((item) => item.slug === product.slug);
          if (existing) {
            const next = current.map((item) =>
              item.slug === product.slug ? { ...item, quantity: item.quantity + quantity } : item,
            );
            showNotice({ ...existing, quantity: existing.quantity + quantity }, next.reduce((sum, item) => sum + item.quantity, 0));
            return next;
          }
          const next = [
            ...current,
            nextItem,
          ];
          showNotice(nextItem, next.reduce((sum, item) => sum + item.quantity, 0));
          return next;
        });
      },
      updateQuantity(slug, quantity) {
        setItems((current) =>
          current.map((item) => (item.slug === slug ? { ...item, quantity } : item)).filter((item) => item.quantity > 0),
        );
      },
      removeItem(slug) {
        setItems((current) => current.filter((item) => item.slug !== slug));
      },
      clear() {
        setItems([]);
      },
    };
  }, [hydrated, items, showNotice]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {notice ? (
        <div className="fixed right-4 top-24 z-[90] w-[min(380px,calc(100vw-32px))] animate-cart-toast rounded-md border border-green-200 bg-white shadow-2xl shadow-stone-900/15">
          <div className="flex items-start gap-3 p-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-50 text-[#2f6b3f]">
              <CheckCircle2 size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-[#1f4b2e]">Đã thêm vào giỏ hàng</p>
              <div className="mt-3 flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-stone-200 bg-stone-100">
                  <Image src={notice.item.image} alt={notice.item.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-bold text-stone-900">{notice.item.name}</p>
                  <p className="mt-1 text-xs font-semibold text-stone-500">
                    Số lượng: {notice.item.quantity} · Tổng giỏ: {notice.total}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/${locale}/cart`} className="inline-flex h-9 items-center gap-2 rounded bg-[#2f6b3f] px-3 text-xs font-black text-white">
                  <ShoppingBag size={14} /> Xem giỏ hàng
                </Link>
                <button onClick={() => setNotice(null)} className="h-9 rounded border border-stone-300 px-3 text-xs font-bold text-stone-700">
                  Mua tiếp
                </button>
              </div>
            </div>
            <button onClick={() => setNotice(null)} className="grid h-8 w-8 shrink-0 place-items-center rounded text-stone-400 hover:bg-stone-100 hover:text-stone-700" aria-label="Đóng thông báo">
              <X size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
