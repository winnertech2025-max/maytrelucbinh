"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Menu, Phone, Search, ShoppingCart, X } from "lucide-react";
import { useRef } from "react";
import { dict, type Locale } from "@/lib/i18n";
import { categories } from "@/lib/mock-data";
import { siteEmail, sitePhone, sitePhoneTel } from "@/lib/site";

export function Header({ locale }: { locale: Locale }) {
  const t = dict[locale];
  const otherLocale = locale === "vi" ? "en" : "vi";
  const menuRef = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#fbfaf7]/95 backdrop-blur">
      <div className="bg-stone-950 text-xs text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-2">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} /> {t.address}
          </span>
          <span className="flex items-center gap-4">
            <a className="flex items-center gap-1.5" href={`mailto:${siteEmail}`}>
              <Mail size={14} /> {siteEmail}
            </a>
            <a className="flex items-center gap-1.5" href={`tel:${sitePhoneTel}`}>
              <Phone size={14} /> {sitePhone}
            </a>
          </span>
        </div>
      </div>
      <div className="container-page flex min-h-20 items-center justify-between gap-4 py-3">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <div className="relative h-14 w-20">
            <Image src="/logo-bamboo.svg" alt="Mây Tre Lục Bình" fill priority sizes="80px" className="object-contain" />
          </div>
          <div className="hidden sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2f6b3f]">Mây Tre Lục Bình</p>
            <p className="text-lg font-black uppercase leading-5 text-stone-900">Nội Thất Mây Tre</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold uppercase text-stone-700 lg:flex">
          <Link href={`/${locale}`}>{t.home}</Link>
          <Link href={`/${locale}/about`}>{t.about}</Link>
          <div className="group relative py-6">
            <Link href={`/${locale}/products`}>{t.products}</Link>
            <div className="invisible absolute left-1/2 top-16 grid w-[620px] -translate-x-1/2 grid-cols-2 gap-1 rounded-md border border-stone-200 bg-white p-3 text-sm normal-case opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
              {categories.slice(0, 10).map((category) => (
                <Link
                  key={category.slug}
                  className="rounded px-3 py-2 hover:bg-stone-100"
                  href={`/${locale}/products?category=${category.slug}`}
                >
                  {locale === "vi" ? category.name : category.nameEn}
                </Link>
              ))}
            </div>
          </div>
          <Link href={`/${locale}/projects`}>{t.projects}</Link>
          <Link href={`/${locale}/contact`}>{t.contact}</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            className="grid h-10 w-10 place-items-center rounded border border-stone-300 bg-white"
            href={`/${locale}/products`}
            aria-label={t.search}
          >
            <Search size={18} />
          </Link>
          <Link
            className="grid h-10 w-10 place-items-center rounded border border-stone-300 bg-white"
            href={`/${locale}/cart`}
            aria-label="Giỏ hàng"
          >
            <ShoppingCart size={18} />
          </Link>
          <Link className="rounded border border-stone-300 px-3 py-2 text-sm font-bold" href={`/${otherLocale}`}>
            {otherLocale.toUpperCase()}
          </Link>
          <details ref={menuRef} className="group relative lg:hidden">
            <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded border border-stone-300 bg-white" aria-label="Menu">
              <Menu size={19} className="group-open:hidden" />
              <X size={19} className="hidden group-open:block" />
            </summary>
            <nav className="absolute right-0 top-12 grid w-64 gap-1 rounded-md border border-stone-200 bg-white p-3 text-sm font-bold uppercase shadow-xl">
              <Link onClick={closeMenu} className="rounded px-3 py-2 hover:bg-stone-100" href={`/${locale}`}>{t.home}</Link>
              <Link onClick={closeMenu} className="rounded px-3 py-2 hover:bg-stone-100" href={`/${locale}/about`}>{t.about}</Link>
              <Link onClick={closeMenu} className="rounded px-3 py-2 hover:bg-stone-100" href={`/${locale}/products`}>{t.products}</Link>
              <Link onClick={closeMenu} className="rounded px-3 py-2 hover:bg-stone-100" href={`/${locale}/projects`}>{t.projects}</Link>
              <Link onClick={closeMenu} className="rounded px-3 py-2 hover:bg-stone-100" href={`/${locale}/contact`}>{t.contact}</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
