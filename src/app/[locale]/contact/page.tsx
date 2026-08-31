import { Mail, MapPin, Phone } from "lucide-react";
import { OrderForm } from "@/components/order-form";
import { asLocale, dict } from "@/lib/i18n";
import { siteEmail, sitePhone } from "@/lib/site";

function weave(color: string, opacity: number, scale = 12) {
  const alpha = opacity.toString(16).padStart(2, "0");
  return {
    backgroundImage: `repeating-linear-gradient(45deg, ${color}${alpha} 0px, ${color}${alpha} 1.5px, transparent 1.5px, transparent ${scale}px), repeating-linear-gradient(-45deg, ${color}${alpha} 0px, ${color}${alpha} 1.5px, transparent 1.5px, transparent ${scale}px)`,
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = asLocale((await params).locale);
  const t = dict[locale];

  return (
    <main className="bg-[#fbf7ef]">
      {/* ---------------- HEADER ---------------- */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 border-b border-stone-200 bg-white">
        <div className="pointer-events-none absolute inset-0 opacity-60" style={weave("#2f6b3f", 8)} />
        <div className="container-page relative py-12">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#2f6b3f]">
            Xưởng ghế mây · Bình Thạnh, TP HCM
          </p>
          <h1 className="mt-3 font-serif text-4xl italic leading-tight text-[#1f4b2e] sm:text-5xl">
            {t.contact}
          </h1>
          <p className="mt-3 max-w-lg text-stone-600">
            Gọi trực tiếp, nhắn tin hoặc để lại yêu cầu — xưởng phản hồi trong ngày làm việc.
          </p>
        </div>
      </section>

      {/* ---------------- BODY ---------------- */}
      <div className="container-page py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
          <section className="space-y-6">
            {/* Contact tiles */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-stone-200 bg-white p-5">
                <MapPin size={20} className="text-[#2f6b3f]" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#c9a06b]">Địa chỉ</p>
                <p className="mt-1 text-sm leading-6 text-stone-700">{t.address}</p>
              </div>
              <a
                href="tel:0964008356"
                className="group rounded-md border border-stone-200 bg-white p-5 transition hover:border-[#2f6b3f]"
              >
                <Phone size={20} className="text-[#2f6b3f]" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#c9a06b]">Điện thoại</p>
                <p className="mt-1 text-sm font-bold text-stone-800 group-hover:text-[#1f4b2e]">
                  {sitePhone}
                </p>
              </a>
              <a
                href={`mailto:${siteEmail}`}
                className="group rounded-md border border-stone-200 bg-white p-5 transition hover:border-[#2f6b3f]"
              >
                <Mail size={20} className="text-[#2f6b3f]" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#c9a06b]">Email</p>
                <p className="mt-1 break-all text-sm font-bold text-stone-800 group-hover:text-[#1f4b2e]">
                  {siteEmail}
                </p>
              </a>
            </div>

            {/* Map, framed like other media on the site */}
            <div className="overflow-hidden rounded-sm border-4 border-white shadow-sm ring-1 ring-[#2f6b3f]/10">
              <div className="aspect-[16/9] w-full bg-stone-200">
                <iframe
                  title="Mây Tre Lục Bình map"
                  className="h-full w-full"
                  loading="lazy"
                  src="https://maps.google.com/maps?q=253%20Bach%20Dang%20Binh%20Thanh%20Ho%20Chi%20Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
                />
              </div>
            </div>
          </section>

          {/* Order form, same card treatment as the product page */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-md border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#2f6b3f]">
                Gửi yêu cầu
              </p>
              <h2 className="mt-1 font-serif text-xl text-[#1f4b2e]">Đặt hàng / tư vấn</h2>
              <div className="mt-5">
                <OrderForm locale={locale} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
