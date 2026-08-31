import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Phone } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductGrid } from "@/components/product-grid";
import { getProductBySlug, getProducts } from "@/lib/data";
import { asLocale, dict } from "@/lib/i18n";
import { ImageZoom } from "@/components/ImageZoom";
import { sitePhone, sitePhoneTel } from "@/lib/site";

export const revalidate = 600;

function weave(color: string, opacity: string, scale = 12) {
  return {
    backgroundImage: `repeating-linear-gradient(45deg, ${color}${opacity} 0px, ${color}${opacity} 1.5px, transparent 1.5px, transparent ${scale}px), repeating-linear-gradient(-45deg, ${color}${opacity} 0px, ${color}${opacity} 1.5px, transparent 1.5px, transparent ${scale}px)`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = asLocale(rawLocale);
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getProducts({ category: product.category, limit: 4 });
  const t = dict[locale];

  const specs = [
    { label: "Chất liệu", value: product.material },
    { label: "Kích thước", value: product.dimensions },
  ].filter((s) => s.value);

  return (
    <main className="bg-[#fbf7ef] text-[#28392b]">
      <div className="container-page py-7 sm:py-10">
        <Link
          href={`/${locale}/products`}
          className="group mb-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#789f78] transition hover:text-[#2f6b3f]"
        >
          <ArrowLeft
            size={15}
            className="transition-transform group-hover:-translate-x-1"
          />
          Quay lại cửa hàng
        </Link>

        <section className="grid gap-8 lg:grid-cols-[minmax(300px,440px)_minmax(0,1fr)] lg:items-center lg:gap-14">
             <ImageZoom src={product.image} alt={product.name} images={product.images} />
           

          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#789f78]">
              {t.products}
            </p>
            <h1 className="mt-3 font-serif text-4xl italic leading-[1.08] tracking-tight text-[#1f5b35] sm:text-5xl">
              {product.name}
            </h1>
            <div
              className="mt-5 h-[3px] w-14"
              style={weave("#2f6b3f", "ff", 5)}
            />

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <p className="rounded-full bg-[#e9f0e3] px-4 py-2 text-lg font-bold text-[#1f4b2e]">
                {product.salePrice || product.price}
              </p>
              <span className="text-xs font-semibold text-stone-500">
                Giá có thể thay đổi theo kích thước và chất liệu
              </span>
            </div>

            <p className="mt-6 text-[15px] leading-7 text-stone-700 sm:text-base">
              {product.description}
            </p>

            {specs.length > 0 && (
              <dl className="mt-7 grid gap-3 sm:grid-cols-2">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-xl border border-[#e1e6da] bg-white/70 px-4 py-3"
                  >
                    <dt className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c9a06b]">
                      {spec.label}
                    </dt>
                    <dd className="mt-1 text-sm leading-5 text-stone-700">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#dce4d5] pt-5 text-xs font-semibold text-stone-600">
              <span className="inline-flex items-center gap-2">
                <Check size={15} className="text-[#2f6b3f]" /> Tư vấn tận tình
              </span>
              <span className="inline-flex items-center gap-2">
                <Check size={15} className="text-[#2f6b3f]" /> Làm theo yêu cầu
              </span>
              <a
                href={`tel:${sitePhoneTel}`}
                className="inline-flex items-center gap-2 text-[#2f6b3f] hover:underline"
              >
                <Phone size={14} /> {sitePhone}
              </a>
            </div>
          </div>
        </section>

        <section id="order" className="mx-auto mt-14 max-w-4xl sm:mt-20">
          <div className="rounded-[1.5rem] border border-[#dfe7d9] bg-white p-5 shadow-[0_10px_30px_rgba(42,61,39,.06)] sm:p-7">
            <div className="grid gap-4 sm:grid-cols-[1fr_220px] sm:items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#789f78]">
                  Luồng mua hàng
                </p>
                <h2 className="mt-1 text-2xl font-black text-[#1f5b35]">Thêm vào giỏ rồi thanh toán</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Sau khi thêm vào giỏ, bạn bấm thanh toán để nhập thông tin và chọn thanh toán tại cửa hàng hoặc khi nhận hàng.
                </p>
              </div>
              <div className="space-y-2">
                <AddToCartButton product={product} />
                <Link href={`/${locale}/cart`} className="inline-flex h-10 w-full items-center justify-center rounded border border-stone-300 text-sm font-bold">
                  Xem giỏ hàng
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-[#e1e6da] pt-12 sm:mt-20 sm:pt-16">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#789f78]">
                Có thể bạn cũng thích
              </p>
              <h2 className="mt-2 font-serif text-3xl italic text-[#1f5b35] sm:text-4xl">
                {t.featuredProducts}
              </h2>
            </div>
            <Link
              href={`/${locale}/products`}
              className="group hidden items-center gap-2 text-sm font-bold text-[#2f6b3f] sm:inline-flex"
            >
              Xem tất cả{" "}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
          <ProductGrid products={related} locale={locale} />
        </section>
      </div>
    </main>
  );
}
