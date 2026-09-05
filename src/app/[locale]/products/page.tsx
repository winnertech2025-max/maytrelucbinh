import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { ProductFilterPanel } from "@/components/product-filter-panel";
import { ProductGrid } from "@/components/product-grid";
import { getCategories, getProductsPage } from "@/lib/data";
import { asLocale, dict } from "@/lib/i18n";
import { sitePhone, sitePhoneTel } from "@/lib/site";

export const revalidate = 60;

function weave(color: string, opacity: number | string, scale = 12) {
  return {
    backgroundImage: `repeating-linear-gradient(45deg, ${color}${opacity} 0px, ${color}${opacity} 1.5px, transparent 1.5px, transparent ${scale}px), repeating-linear-gradient(-45deg, ${color}${opacity} 0px, ${color}${opacity} 1.5px, transparent 1.5px, transparent ${scale}px)`,
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; page?: string; sort?: string }>;
}) {
  const locale = asLocale((await params).locale);
  const { category, q, page: pageParam, sort = "newest" } = await searchParams;
  const t = dict[locale];
  const currentPage = Math.max(1, Number(pageParam || 1) || 1);
  const pageSize = 12;
  const [productPage, categories] = await Promise.all([
    getProductsPage({ category, query: q, limit: pageSize, page: currentPage, sort: sort as "newest" | "oldest" | "name" }),
    getCategories(),
  ]);
  const { products, total, totalPages } = productPage;
  const makeHref = (page: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const queryString = params.toString();
    return `/${locale}/products${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <main className="bg-[#fbf7ef]">
      {/* ---------------- HEADER (redesigned) ---------------- */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 border-b border-stone-200 bg-white">
        <div className="pointer-events-none absolute inset-0 opacity-60" style={weave("#2f6b3f", 8)} />
        <div className="container-page relative flex flex-col gap-6 py-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#2f6b3f]">
              Bộ sưu tập xưởng
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-[#1f4b2e] sm:text-5xl">
              {t.products}
            </h1>
            <div className="mt-3 h-[3px] w-12" style={weave("#2f6b3f", "ff", 5)} />
            <p className="mt-4 max-w-xl leading-7 text-stone-600">
              Chọn mẫu, gửi yêu cầu kích thước/màu/nệm, xưởng báo giá nhanh theo đúng
              không gian của bạn.
            </p>
          </div>
          <a
            href={`tel:${sitePhoneTel}`}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded bg-[#2f6b3f] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1f4b2e]"
          >
            <Phone size={16} /> Gọi tư vấn: {sitePhone}
          </a>
        </div>
      </section>

      {/* ---------------- BODY (unchanged) ---------------- */}
      <div className="container-page py-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_330px] lg:items-start">
          <section className="order-2 lg:order-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-stone-600">
                {products.length} / {total} mẫu đang hiển thị
              </p>
              <Link href={`/${locale}/contact`} className="hidden items-center gap-2 text-sm font-black text-[#2f6b3f] sm:inline-flex">
                Cần làm theo mẫu riêng <ArrowRight size={16} />
              </Link>
            </div>
            <ProductGrid products={products} locale={locale} compact />
            <nav className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Link
                className={`rounded border px-4 py-2 text-sm font-black ${currentPage <= 1 ? "pointer-events-none border-stone-200 text-stone-300" : "border-stone-300 bg-white text-stone-800 hover:border-[#2f6b3f]"}`}
                href={makeHref(Math.max(1, currentPage - 1))}
              >
                Trước
              </Link>
              {Array.from({ length: totalPages }).slice(0, 7).map((_, index) => {
                const page = index + 1;
                return (
                  <Link
                    key={page}
                    className={`grid h-10 w-10 place-items-center rounded border text-sm font-black ${page === currentPage ? "border-[#2f6b3f] bg-[#2f6b3f] text-white" : "border-stone-300 bg-white"}`}
                    href={makeHref(page)}
                  >
                    {page}
                  </Link>
                );
              })}
              {totalPages > 7 ? <span className="px-2 text-stone-500">...</span> : null}
              <Link
                className={`rounded border px-4 py-2 text-sm font-black ${currentPage >= totalPages ? "pointer-events-none border-stone-200 text-stone-300" : "border-stone-300 bg-white text-stone-800 hover:border-[#2f6b3f]"}`}
                href={makeHref(Math.min(totalPages, currentPage + 1))}
              >
                Sau
              </Link>
              <form className="ml-2 flex items-center gap-2" action={`/${locale}/products`}>
                {category ? <input type="hidden" name="category" value={category} /> : null}
                {q ? <input type="hidden" name="q" value={q} /> : null}
                {sort && sort !== "newest" ? <input type="hidden" name="sort" value={sort} /> : null}
                <label className="text-sm font-bold text-stone-600" htmlFor="product-page-jump">Tới trang</label>
                <input
                  id="product-page-jump"
                  name="page"
                  type="number"
                  min={1}
                  max={totalPages}
                  defaultValue={currentPage}
                  className="h-10 w-20 rounded border border-stone-300 bg-white px-3 text-center text-sm font-black"
                />
                <button className="h-10 rounded border border-stone-300 bg-white px-3 text-sm font-black hover:border-[#2f6b3f]">
                  Đi
                </button>
              </form>
            </nav>
          </section>

          <aside className="order-1 lg:order-2 lg:sticky lg:top-28">
            <ProductFilterPanel locale={locale} categories={categories} category={category} query={q} sort={sort} />
            <div className="mt-5 overflow-hidden rounded-md border border-stone-200 bg-white shadow-xl shadow-stone-200/70">
              <div className="border-t border-stone-200">
                <Link className={`flex items-center justify-between px-5 py-3 text-sm font-black ${!category ? "bg-green-50 text-[#2f6b3f]" : "hover:bg-stone-50"}`} href={`/${locale}/products`}>
                  {t.all}
                  <span className="text-[#c49a5a]">›</span>
                </Link>
                {categories.slice(0, 10).map((item, index) => (
                  <Link
                    key={item.slug}
                    className={`block border-t border-stone-200 px-5 py-3 text-sm font-bold uppercase leading-5 ${category === item.slug ? "bg-green-50 text-[#2f6b3f]" : "hover:bg-stone-50"}`}
                    href={`/${locale}/products?category=${item.slug}`}
                  >
                    <span className="mr-2 text-[#e8852d]">▸</span>
                    {locale === "vi" ? item.name : item.nameEn}
                    {index < 2 ? (
                      <span className="mt-2 block pl-5 text-xs font-semibold normal-case leading-5 text-stone-500">
                        + Sofa, bàn ghế cafe, ghế hồ bơi, phòng ăn
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
              <div className="m-5 rounded-md bg-[#f4f9ec] p-4">
                <p className="text-sm font-black text-[#2f6b3f]">Ưu đãi khi đặt tại xưởng</p>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  Tư vấn phối mẫu miễn phí, nhận làm kích thước riêng, báo giá nhanh qua hotline.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
