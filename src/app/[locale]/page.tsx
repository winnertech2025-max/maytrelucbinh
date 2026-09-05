import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { getCategories, getProducts, projects } from "@/lib/data";
import { asLocale, dict } from "@/lib/i18n";
import { sitePhone, sitePhoneTel } from "@/lib/site";

export const revalidate = 60;

const tickerItems = [
  "Xưởng sản xuất trực tiếp",
  "Mây tre đan thủ công",
  "Lục bình tự nhiên",
  "Nhận làm theo yêu cầu",
  "Giao hàng toàn quốc",
];

const process: { step: string; title: string; desc: string }[] = [
  { step: "01", title: "Chọn nguyên liệu", desc: "Mây, tre, lục bình phơi khô tự nhiên, tuyển từng sợi." },
  { step: "02", title: "Đan thủ công", desc: "Thợ lành nghề đan theo khung, không qua khuôn máy loạt." },
  { step: "03", title: "Hoàn thiện", desc: "Sơn phủ, bọc nệm, kiểm tra từng mối đan trước khi xuất." },
  { step: "04", title: "Giao tận nơi", desc: "Đóng gói cẩn thận, giao hàng và lắp đặt tận nhà." },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = asLocale((await params).locale);
  const t = dict[locale];
  const [newProducts, featuredProducts, categories] = await Promise.all([
    getProducts({ limit: 8 }),
    getProducts({ limit: 8 }),
    getCategories(),
  ]);
  const heroImage = "/bestBanner.png";

  return (
    <main className="bg-[#fbf7ef] text-stone-800">
      {/* ---------------- FULL-BLEED HERO ---------------- */}
      <section className="relative left-1/2 h-[76vh] min-h-[560px] w-screen -translate-x-1/2 overflow-hidden">
        <Image
          src={heroImage}
          alt="Nội thất mây tre Lục Bình"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12281a] via-[#12281a]/55 to-[#12281a]/10" />

        <div className="container-page relative flex h-full flex-col justify-end pb-36">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#c9dfc9]">
            Xưởng ghế mây · Bình Thạnh, TP HCM
          </p>
          <h1 className="mt-4 max-w-3xl text-[clamp(3.25rem,7vw,5.8rem)] font-black leading-[1.02] text-white">
            {locale === "vi" ? (
              <>
                Đan nên
                <br />
                <span className="inline-block text-[#a9d7ab]">không gian sống</span>
              </>
            ) : (
              <>
                Woven
                <br />
                <span className="inline-block text-[#a9d7ab]">living spaces</span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-md text-white/80">
            Mây tre, lục bình đan thủ công — sản xuất trực tiếp tại xưởng, nhận làm
            theo yêu cầu số lượng lớn hoặc đơn lẻ.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/products`}
              className="inline-flex h-12 items-center gap-2 rounded bg-white px-5 text-sm font-bold text-[#1f4b2e] transition hover:bg-[#a9d7ab]"
            >
              Xem sản phẩm <ArrowRight size={16} />
            </Link>
            <a
              href={`tel:${sitePhoneTel}`}
              className="inline-flex h-12 items-center gap-2 rounded border border-white/40 px-5 text-sm font-bold text-white transition hover:border-white"
            >
              <Phone size={15} /> {sitePhone}
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- SCROLLING TRUST TICKER ---------------- */}
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#1f4b2e] py-3">
        <div className="animate-[scroll_28s_linear_infinite] flex w-max gap-10 whitespace-nowrap text-sm font-bold uppercase tracking-widest text-[#a9d7ab]">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="flex items-center gap-10">
              {item} <span className="text-white/30">◆</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }`}</style>
      </div>

      {/* ---------------- HORIZONTAL CATEGORY RAIL ---------------- */}
      <section className="py-16">
        <div className="container-page mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#2f6b3f]">
              {t.categories}
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#1f4b2e] md:text-4xl">
              Danh mục sản phẩm
            </h2>
          </div>
          <p className="hidden text-sm text-stone-500 sm:block">Kéo ngang để xem thêm →</p>
        </div>
        <div className="container-page flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/${locale}/products?category=${category.slug}`}
              className="group w-64 shrink-0 snap-start rounded-md border border-stone-200 bg-white p-5 shadow-sm transition hover:border-[#2f6b3f]"
            >
            
              <h3 className="mt-3 font-serif text-lg text-[#1f4b2e]">
                {locale === "vi" ? category.name : category.nameEn}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">
                {category.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[#2f6b3f] opacity-0 transition group-hover:opacity-100">
                Xem thêm <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- PROCESS (genuine sequence, numbered) ---------------- */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#1f4b2e] py-16">
        <div className="container-page">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#a9d7ab]">
            Quy trình
          </p>
          <h2 className="mt-2 font-serif text-3xl text-white md:text-4xl">
            Từ nguyên liệu đến sản phẩm
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {process.map(({ step, title, desc }, i) => (
              <div key={step} className="relative border-l border-white/15 pl-5">
                <span className="font-serif text-4xl text-[#a9d7ab]">{step}</span>
                <h3 className="mt-3 font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{desc}</p>
                {i < process.length - 1 && (
                  <ArrowRight
                    size={16}
                    className="absolute -right-4 top-1 hidden text-white/25 lg:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- NEW PRODUCTS ---------------- */}
      <section className="container-page py-16">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#2f6b3f]">
            Vừa cập nhật
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#1f4b2e] md:text-4xl">
            {t.newProducts}
          </h2>
        </div>
        <ProductGrid products={newProducts} locale={locale} />
      </section>

      {/* ---------------- FEATURED PRODUCTS ---------------- */}
      <section className="container-page pb-16">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#2f6b3f]">
            Được yêu thích
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#1f4b2e] md:text-4xl">
            {t.featuredProducts}
          </h2>
        </div>
        <ProductGrid products={featuredProducts} locale={locale} />
      </section>

      {/* ---------------- PROJECTS: alternating editorial rows ---------------- */}
     <section className="container-page py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#2f6b3f]">
            Công trình thực tế
          </p>
          <h2 className="mt-2 font-serif text-3xl italic text-[#1f4b2e] md:text-4xl">
            Đã thi công
          </h2>
        </div>
        <p className="hidden max-w-xs text-right text-sm text-stone-500 sm:block">
          Một vài không gian đã lắp đặt nội thất mây tre thực tế của xưởng.
        </p>
      </div>
 
      <div className="grid gap-4 md:grid-cols-3 md:auto-rows-[220px]">
        {projects.map((project, i) => (
          <article
            key={project.title}
            className={`group relative overflow-hidden rounded-md bg-stone-900 ${
              i === 0 ? "md:col-span-2 md:row-span-2" : ""
            }`}
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
              className="object-cover transition duration-500 ease-out group-hover:scale-105"
            />
 
            {/* base gradient so text stays legible even before hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
 
            <span className="absolute left-3 top-3 rounded-sm bg-[#2f6b3f]/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Dự án {String(i + 1).padStart(2, "0")}
            </span>
 
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3
                className={`font-serif text-white ${
                  i === 0 ? "text-2xl md:text-3xl" : "text-lg"
                }`}
              >
                {project.title}
              </h3>
              <p className="mt-1.5 max-w-md text-sm leading-6 text-white/80 line-clamp-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {project.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
    </main>
  );
}
