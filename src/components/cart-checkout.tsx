"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Locale, PaymentMethod } from "@/lib/types";
import { useCart } from "./cart-provider";

export function CartCheckout({ locale }: { locale: Locale }) {
  const cart = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [orderId, setOrderId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(formData: FormData) {
    if (cart.items.length === 0 || state === "loading") return;
    setState("loading");
    setErrorMessage("");
    const startedAt = Date.now();
    const payload = {
      customer_name: String(formData.get("customer_name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      address: String(formData.get("address") || ""),
      note: String(formData.get("note") || ""),
      payment_method: String(formData.get("payment_method") || "cod") as PaymentMethod,
      items: cart.items.map((item) => ({
        product_slug: item.slug,
        product_name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as { id?: string; error?: string };
      const waitForMinimumLoading = new Promise((resolve) => setTimeout(resolve, Math.max(0, 650 - (Date.now() - startedAt))));
      await waitForMinimumLoading;
      if (!response.ok) {
        setErrorMessage(result.error || "Chưa tạo được đơn, vui lòng thử lại.");
        setState("error");
        return;
      }
      setOrderId(result.id || "");
      cart.clear();
      setState("success");
    } catch {
      setErrorMessage("Mất kết nối khi tạo đơn, vui lòng thử lại.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <main className="container-page py-10">
        <div className="mx-auto max-w-2xl rounded-md border border-green-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-50 text-[#2f6b3f]">
            <CheckCircle2 size={34} />
          </div>
          <h1 className="mt-5 text-3xl font-black uppercase text-[#1f4b2e]">Đã nhận đơn hàng</h1>
          <p className="mt-3 text-stone-600">
            Cảm ơn bạn. Xưởng Mây Tre Lục Bình đã ghi nhận đơn và sẽ liên hệ xác nhận trong thời gian sớm nhất.
          </p>
          {orderId ? (
            <p className="mt-4 rounded bg-stone-50 p-3 text-sm font-bold text-stone-700">
              Mã đơn: <span className="text-[#2f6b3f]">{orderId}</span>
            </p>
          ) : null}
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/${locale}/products`} className="inline-flex h-11 items-center justify-center gap-2 rounded bg-[#2f6b3f] px-5 text-sm font-black text-white">
              <ShoppingBag size={16} /> Tiếp tục xem sản phẩm
            </Link>
            <Link href={`/${locale}/contact`} className="inline-flex h-11 items-center justify-center rounded border border-stone-300 px-5 text-sm font-bold text-stone-700">
              Liên hệ xưởng
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page py-10">
      <h1 className="text-3xl font-black uppercase">Giỏ hàng</h1>
      {!cart.hydrated ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="rounded-md border border-stone-200 bg-white p-4">
            <div className="h-24 animate-pulse rounded bg-stone-100" />
          </div>
          <div className="rounded-md border border-stone-200 bg-white p-5">
            <div className="h-6 w-32 animate-pulse rounded bg-stone-100" />
            <div className="mt-4 h-11 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      ) : cart.items.length === 0 ? (
        <div className="mt-6 rounded-md border border-stone-200 bg-white p-8 text-center">
          <p className="font-semibold text-stone-600">Giỏ hàng đang trống.</p>
          <Link href={`/${locale}/products`} className="mt-4 inline-flex rounded bg-[#2f6b3f] px-5 py-3 font-bold text-white">
            Xem sản phẩm
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="rounded-md border border-stone-200 bg-white">
            {cart.items.map((item) => (
              <div key={item.slug} className="grid gap-4 border-b border-stone-100 p-4 last:border-0 sm:grid-cols-[90px_1fr_auto]">
                <div className="relative h-24 w-24 overflow-hidden rounded bg-stone-100">
                  <Image src={item.image} alt={item.name} fill sizes="90px" className="object-contain" />
                </div>
                <div>
                  <p className="font-black uppercase">{item.name}</p>
                  <p className="mt-1 text-sm font-bold text-red-600">{item.price}</p>
                  <div className="mt-3 inline-flex items-center rounded border border-stone-300">
                    <button onClick={() => cart.updateQuantity(item.slug, item.quantity - 1)} className="grid h-9 w-9 place-items-center">
                      <Minus size={14} />
                    </button>
                    <span className="grid h-9 w-10 place-items-center border-x border-stone-300 text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => cart.updateQuantity(item.slug, item.quantity + 1)} className="grid h-9 w-9 place-items-center">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button onClick={() => cart.removeItem(item.slug)} className="self-start rounded border border-red-200 px-3 py-2 text-sm font-bold text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </section>

          <aside className="rounded-md border border-stone-200 bg-white p-5">
            <p className="text-xl font-black">Thanh toán</p>
            <p className="mt-2 text-sm text-stone-600">{cart.count} sản phẩm trong giỏ.</p>
            {!checkoutOpen ? (
              <button onClick={() => setCheckoutOpen(true)} className="mt-5 h-11 w-full rounded bg-[#2f6b3f] font-black text-white">
                Thanh toán
              </button>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submit(new FormData(event.currentTarget));
                }}
                className="relative mt-5 grid gap-3"
              >
                {state === "loading" ? (
                  <div className="absolute inset-0 z-10 grid place-items-center rounded bg-white/82 backdrop-blur-[1px]">
                    <div className="text-center">
                      <Loader2 className="mx-auto animate-spin text-[#2f6b3f]" size={26} />
                      <p className="mt-2 text-sm font-black text-stone-800">Đang tạo đơn hàng...</p>
                      <p className="mt-1 text-xs text-stone-500">Vui lòng chờ vài giây.</p>
                    </div>
                  </div>
                ) : null}
                <input required name="customer_name" placeholder="Họ tên" className="h-11 rounded border border-stone-300 px-3" />
                <input required name="phone" placeholder="Số điện thoại" className="h-11 rounded border border-stone-300 px-3" />
                <input name="email" type="email" placeholder="Email nhận cập nhật đơn" className="h-11 rounded border border-stone-300 px-3" />
                <input name="address" placeholder="Địa chỉ" className="h-11 rounded border border-stone-300 px-3" />
                <select name="payment_method" className="h-11 rounded border border-stone-300 px-3">
                  <option value="store">Thanh toán tại cửa hàng</option>
                  <option value="cod">Thanh toán khi nhận hàng</option>
                </select>
                <textarea name="note" rows={4} placeholder="Ghi chú" className="rounded border border-stone-300 px-3 py-2" />
                <button disabled={state === "loading"} className="h-11 rounded bg-[#2f6b3f] font-black text-white disabled:opacity-60">
                  {state === "loading" ? "Đang tạo đơn..." : "Hoàn tất đặt hàng"}
                </button>
                {state === "error" ? (
                  <p className="rounded bg-red-50 p-3 text-sm font-bold text-red-700">
                    {errorMessage || "Chưa tạo được đơn."}
                  </p>
                ) : null}
              </form>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
