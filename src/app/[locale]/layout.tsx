import { notFound } from "next/navigation";
import { ConditionalHeader } from "@/components/conditional-header";
import { ConditionalPublicShell } from "@/components/conditional-public-shell";
import { CartProvider } from "@/components/cart-provider";
import { NavigationProgress } from "@/components/navigation-progress";
import { asLocale, locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!locales.includes(rawLocale as never)) notFound();
  const locale = asLocale(rawLocale);

  return (
    <>
      <CartProvider>
        <NavigationProgress />
        <ConditionalHeader locale={locale} />
        {children}
        <ConditionalPublicShell locale={locale} />
      </CartProvider>
    </>
  );
}
