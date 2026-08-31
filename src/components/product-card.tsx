import Image from "next/image";
import Link from "next/link";
import { Heart, Phone, Sparkles } from "lucide-react";
import type { Locale, Product } from "@/lib/types";
import { dict } from "@/lib/i18n";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const t = dict[locale];

  return (
    <article className="reveal-up group overflow-hidden rounded-md border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-[#2f6b3f]/40 hover:shadow-xl">
      <Link href={`/${locale}/products/${product.slug}`} className="block">
        <div className="relative flex aspect-[250/247] items-center justify-center bg-stone-100 p-3">
          {product.isNew ? (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#c49a5a] px-2.5 py-1 text-xs font-bold text-white shadow">
              <Sparkles size={12} /> New
            </span>
          ) : null}
          <span className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#2f6b3f] shadow transition group-hover:scale-110">
            <Heart size={15} />
          </span>
          <div className="relative h-full w-full max-w-[250px]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              loading="eager"
              sizes="250px"
              className="pointer-events-none object-contain transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-12 text-sm font-bold uppercase leading-6 text-stone-900">
            {product.name}
          </h3>
        </Link>
        <p className="rounded bg-green-50 px-3 py-2 text-sm leading-6 text-stone-700">
          <span className="block font-bold text-[#2f6b3f]">{t.quote}</span>
          <span className="block break-words font-black text-red-600">
            {product.salePrice || product.price}
          </span>
        </p>
        <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
          <span>Đặt làm theo kích thước</span>
          <span className="inline-flex items-center gap-1 text-[#2f6b3f]"><Phone size={13} /> Tư vấn</span>
        </div>
        <AddToCartButton product={product} label={t.orderNow} />
      </div>
    </article>
  );
}
