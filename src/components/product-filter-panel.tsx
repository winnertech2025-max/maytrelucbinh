"use client";

import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Category, Locale } from "@/lib/types";

export function ProductFilterPanel({
  locale,
  categories,
  category,
  query,
  sort,
}: {
  locale: Locale;
  categories: Category[];
  category?: string;
  query?: string;
  sort?: string;
}) {
  const router = useRouter();

  function apply(next: { category?: string; query?: string; sort?: string }) {
    const params = new URLSearchParams();
    const nextCategory = next.category ?? category ?? "";
    const nextQuery = next.query ?? query ?? "";
    const nextSort = next.sort ?? sort ?? "newest";
    if (nextCategory) params.set("category", nextCategory);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextSort && nextSort !== "newest") params.set("sort", nextSort);
    router.push(`/${locale}/products${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        apply({
          query: String(form.get("q") || ""),
          category: String(form.get("category") || ""),
          sort: String(form.get("sort") || "newest"),
        });
      }}
      className="overflow-hidden rounded-md border border-stone-200 bg-white shadow-xl shadow-stone-200/70"
    >
      <div className="bg-stone-950 px-5 py-4 text-white">
        <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
          <SlidersHorizontal size={16} /> Danh mục sản phẩm
        </p>
      </div>
      <div className="space-y-4 p-5">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-700">
            <Search size={15} /> Tìm nhanh
          </span>
          <input
            name="q"
            defaultValue={query}
            placeholder="Tìm sản phẩm, mã hàng..."
            className="h-11 w-full rounded border border-stone-300 bg-[#fbfaf7] px-3"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-stone-700">Nhóm sản phẩm</span>
          <select
            name="category"
            defaultValue={category || ""}
            onChange={(event) => apply({ category: event.target.value })}
            className="h-11 w-full rounded border border-stone-300 bg-[#fbfaf7] px-3"
          >
            <option value="">Tất cả</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {locale === "vi" ? item.name : item.nameEn}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-stone-700">Sắp xếp</span>
          <select
            name="sort"
            defaultValue={sort || "newest"}
            onChange={(event) => apply({ sort: event.target.value })}
            className="h-11 w-full rounded border border-stone-300 bg-[#fbfaf7] px-3"
          >
            <option value="newest">Đăng mới nhất</option>
            <option value="oldest">Đăng lâu nhất</option>
            <option value="name">Tên A-Z</option>
          </select>
        </label>
        <button className="h-11 w-full rounded bg-[#2f6b3f] font-black text-white shadow-sm transition hover:bg-[#1f4b2e]">
          Tìm sản phẩm phù hợp
        </button>
      </div>
    </form>
  );
}
