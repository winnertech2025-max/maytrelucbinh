import { asLocale } from "@/lib/i18n";
import { CartCheckout } from "@/components/cart-checkout";

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = asLocale((await params).locale);
  return <CartCheckout locale={locale} />;
}
