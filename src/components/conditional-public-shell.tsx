"use client";

import { usePathname } from "next/navigation";
import { FloatingContact } from "@/components/floating-contact";
import { Footer } from "@/components/footer";
import type { Locale } from "@/lib/i18n";

export function ConditionalPublicShell({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  if (pathname === `/${locale}/admin` || pathname.startsWith(`/${locale}/admin/`)) {
    return null;
  }

  return (
    <>
      <FloatingContact />
      <Footer locale={locale} />
    </>
  );
}
