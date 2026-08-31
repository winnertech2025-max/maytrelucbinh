"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { Locale, Product } from "@/lib/types";
import { dict } from "@/lib/i18n";
import { sitePhone } from "@/lib/site";

export function OrderForm({ product, locale }: { product?: Product; locale: Locale }) {
  const t = dict[locale];
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(formData: FormData) {
    setState("loading");
    const payload = {
      customer_name: String(formData.get("customer_name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      address: String(formData.get("address") || ""),
      note: String(formData.get("note") || ""),
      product_slug: product?.slug,
      product_name: product?.name,
      quantity: Number(formData.get("quantity") || 1),
    };

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setState(response.ok ? "success" : "error");
  }

  return (
    <form action={submit} className="grid gap-4 rounded-md border border-stone-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-lg font-black uppercase">{t.orderNow}</p>
        {product ? <p className="mt-1 text-sm text-stone-600">{product.name}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          {t.customerName}
          <input required name="customer_name" className="mt-1 h-11 w-full rounded border border-stone-300 px-3" />
        </label>
        <label className="text-sm font-semibold">
          {t.phone}
          <input required name="phone" className="mt-1 h-11 w-full rounded border border-stone-300 px-3" />
        </label>
        <label className="text-sm font-semibold">
          Email
          <input name="email" type="email" className="mt-1 h-11 w-full rounded border border-stone-300 px-3" />
        </label>
        <label className="text-sm font-semibold">
          Số lượng
          <input name="quantity" type="number" min={1} defaultValue={1} className="mt-1 h-11 w-full rounded border border-stone-300 px-3" />
        </label>
      </div>
      <label className="text-sm font-semibold">
        Địa chỉ
        <input name="address" className="mt-1 h-11 w-full rounded border border-stone-300 px-3" />
      </label>
      <label className="text-sm font-semibold">
        {t.note}
        <textarea name="note" rows={4} className="mt-1 w-full rounded border border-stone-300 px-3 py-2" />
      </label>
      <button
        disabled={state === "loading"}
        className="inline-flex h-11 items-center justify-center gap-2 rounded bg-[#2f6b3f] px-5 font-bold text-white disabled:opacity-60"
      >
        <Send size={16} /> {state === "loading" ? "Đang gửi..." : t.submitOrder}
      </button>
      {state === "success" ? (
        <p className="rounded bg-green-50 p-3 text-sm font-semibold text-green-700">
          Đã gửi yêu cầu. Xưởng sẽ liên hệ lại trong thời gian sớm nhất.
        </p>
      ) : null}
      {state === "error" ? (
        <p className="rounded bg-red-50 p-3 text-sm font-semibold text-red-700">
          Chưa gửi được yêu cầu, vui lòng gọi hotline {sitePhone}.
        </p>
      ) : null}
    </form>
  );
}
