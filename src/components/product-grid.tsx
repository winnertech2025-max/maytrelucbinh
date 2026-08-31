import type { Locale, Product } from "@/lib/types";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  locale,
  compact = false,
}: {
  products: Product[];
  locale: Locale;
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 ${compact ? "xl:grid-cols-3" : "lg:grid-cols-4"}`}>
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} locale={locale} />
      ))}
    </div>
  );
}
