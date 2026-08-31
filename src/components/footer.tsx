import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { dict, type Locale } from "@/lib/i18n";
import { siteDomain, siteEmail, sitePhone, sitePhoneSecondary, sitePhoneTel } from "@/lib/site";

export function Footer({ locale }: { locale: Locale }) {
  const t = dict[locale];
  const socials = [
    { label: "Facebook", short: "f", href: "https://www.facebook.com/Banghemaytrenhuagiamay" },
    { label: "YouTube", short: "▶", href: "https://www.youtube.com/channel/UCLzfNUJsQKVQbZ6qFCnvn0Q" },
    { label: "Pinterest", short: "P", href: "https://www.pinterest.com/banghemaytrenhuagiamay/" },
  ];

  return (
    <footer className="mt-16 bg-stone-950 text-stone-100">
      <div className="container-page grid gap-8 py-12 lg:grid-cols-[1.3fr_0.8fr_1fr]">
        <div>
          <p className="text-xl font-black uppercase">Công Ty TNHH Nội Thất Mây Tre Lục Bình</p>
          <div className="mt-2 h-0.5 w-10 bg-white" />
          <div className="mt-6 space-y-4 text-sm leading-6 text-stone-300">
            <p><span className="font-black text-white">MST:</span> 0313994688</p>
            <p><span className="font-black text-white">Địa chỉ mới:</span> 253 Bạch Đằng, P.15, Q.Bình Thạnh, TP.HCM</p>
            <p><span className="font-black text-white">Địa chỉ cũ:</span> 1S (số cũ 105) Đinh Bộ Lĩnh, P.15, Q.Bình Thạnh, TP.HCM</p>
            <p><span className="font-black text-white">Hotline:</span> {sitePhone} - {sitePhoneSecondary}</p>
            <p><span className="font-black text-white">Email:</span> {siteEmail}</p>
            <p><span className="font-black text-white">Website:</span> {siteDomain}</p>
          </div>
        </div>

        <div>
          <p className="text-base font-black uppercase">Liên hệ</p>
          <div className="mt-2 h-0.5 w-10 bg-white" />
          <div className="mt-6 space-y-3 text-sm text-stone-300">
            <p className="flex gap-2"><MapPin size={16} className="mt-1 shrink-0" /> {t.address}</p>
            <a className="flex gap-2 hover:text-white" href={`tel:${sitePhoneTel}`}><Phone size={16} /> {sitePhone}</a>
            <a className="flex gap-2 hover:text-white" href={`mailto:${siteEmail}`}><Mail size={16} /> {siteEmail}</a>
          </div>
          <div className="mt-5 flex gap-2">
            {socials.map(({ label, href, short }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded border border-white/15 text-white transition hover:border-[#2f6b3f] hover:bg-[#2f6b3f]"
              >
                <span className="text-sm font-black">{short}</span>
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-base font-black uppercase">Đăng ký nhận tin</p>
          <div className="mt-2 h-0.5 w-10 bg-white" />
          <p className="mt-6 text-sm leading-6 text-stone-300">
            Hãy để lại địa chỉ email của bạn để nhận thông tin mới nhất từ chúng tôi.
          </p>
          <form className="mt-4 flex">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="h-11 min-w-0 flex-1 rounded-l bg-white px-3 text-sm text-stone-900 outline-none"
            />
            <button className="h-11 rounded-r bg-[#2f6b3f] px-5 text-sm font-black text-white hover:bg-[#1f4b2e]">
              Gửi
            </button>
          </form>
          <div className="mt-5 grid gap-2 text-sm text-stone-300">
            <Link className="hover:text-white" href={`/${locale}/products`}>{t.products}</Link>
            <Link className="hover:text-white" href={`/${locale}/contact`}>{t.contact}</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-stone-500">
        © Mây Tre Lục Bình. Thiết kế và sản xuất nội thất mây tre theo yêu cầu.
      </div>
    </footer>
  );
}
