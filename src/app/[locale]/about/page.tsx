import Image from "next/image";
import { getProducts } from "@/lib/data";
import { asLocale, dict } from "@/lib/i18n";

function weave(color: string, opacity: number, scale = 12) {
  return {
    backgroundImage: `repeating-linear-gradient(45deg, ${color}${opacity} 0px, ${color}${opacity} 1.5px, transparent 1.5px, transparent ${scale}px), repeating-linear-gradient(-45deg, ${color}${opacity} 0px, ${color}${opacity} 1.5px, transparent 1.5px, transparent ${scale}px)`,
  };
}

const productGroups = [
  "Bàn ghế mây tự nhiên",
  "Sofa mây",
  "Bàn ghế cafe",
  "Ghế hồ bơi",
  "Bình phong",
  "Xích đu",
  "Ghế tổ chim check-in",
  "Lưới mây",
  "Giỏ / sọt trưng bày",
];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = asLocale((await params).locale);
  const t = dict[locale];
  const products = await getProducts({ limit: 2 });

  return (
    <main className="bg-[#fbf7ef]">
      {/* ---------------- INTRO ---------------- */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 border-b border-stone-200 bg-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={weave("#2f6b3f", 8)}
        />
        <div className="container-page relative py-14">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#2f6b3f]">
            Xưởng ghế mây · Bình Thạnh, TP HCM
          </p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl italic leading-tight text-[#1f4b2e] sm:text-5xl">
            {t.about}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-600">
            Mây Tre Lục Bình chuyên sản xuất nội thất mây tre đan, ngoại thất nhựa giả
            mây và sản phẩm trang trí thủ công tại TP HCM.
          </p>
        </div>
      </section>

      {/* ---------------- BODY ---------------- */}
      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Story column */}
          <div className="space-y-10">
            <div className="grid gap-6 sm:grid-cols-[120px_1fr]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a06b]">
                Xưởng
              </p>
              <p className="leading-8 text-stone-700">
                Mây Tre Lục Bình chuyên sản xuất nội thất mây tre đan, ngoại thất nhựa
                giả mây và sản phẩm trang trí thủ công tại TP HCM.
              </p>
            </div>

            <div className="h-px w-full" style={weave("#2f6b3f", 30, 8)} />

            <div className="grid gap-6 sm:grid-cols-[120px_1fr]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a06b]">
                Website mới
              </p>
              <p className="leading-8 text-stone-700">
                Website mới được xây lại bằng NextJS để tải nhanh hơn, tối ưu SEO,
                responsive trên điện thoại và có CMS để đội ngũ cập nhật sản phẩm, theo
                dõi đơn hàng mà không cần sửa code.
              </p>
            </div>

            <div className="h-px w-full" style={weave("#2f6b3f", 30, 8)} />

            <div className="grid gap-6 sm:grid-cols-[120px_1fr]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a06b]">
                Sản phẩm chính
              </p>
              <div>
                <p className="leading-8 text-stone-700">
                  Các nhóm sản phẩm chính của xưởng:
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {productGroups.map((group) => (
                    <span
                      key={group}
                      className="rounded-full border border-[#2f6b3f]/25 bg-[#eef7ed] px-3 py-1.5 text-sm font-medium text-[#1f4b2e]"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Image stack, sticky on desktop */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="grid gap-4">
              {products.map((product, i) => (
                <div
                  key={product.slug}
                  className={`relative aspect-[250/247] max-w-[250px] overflow-hidden rounded-sm border-4 border-white bg-stone-100 shadow-sm ring-1 ring-[#2f6b3f]/10 ${
                    i === 0 ? "" : "ml-6"
                  }`}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="250px"
                    className="object-contain"
                  />
                  {i === 0 && (
                    <span className="absolute left-0 top-0 rounded-br-md bg-[#2f6b3f] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Sản phẩm nổi bật
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
