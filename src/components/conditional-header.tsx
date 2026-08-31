"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import type { Locale } from "@/lib/i18n";

export function ConditionalHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  if (pathname === `/${locale}/admin` || pathname.startsWith(`/${locale}/admin/`)) {
    return null;
  }

  return <Header locale={locale} />;
}
