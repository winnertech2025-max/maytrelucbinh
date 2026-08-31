import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { projects } from "@/lib/data";
import { asLocale, dict } from "@/lib/i18n";

function weave(color: string, opacity: string, scale = 12) {
  return {
    backgroundImage: `repeating-linear-gradient(45deg, ${color}${opacity} 0px, ${color}${opacity} 1.5px, transparent 1.5px, transparent ${scale}px), repeating-linear-gradient(-45deg, ${color}${opacity} 0px, ${color}${opacity} 1.5px, transparent 1.5px, transparent ${scale}px)`,
  };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = asLocale((await params).locale);
  const t = dict[locale];

  return (
    <main className="bg-[#fbf7ef]">
      {/* ---------------- HEADER ---------------- */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 border-b border-stone-200 bg-white">
        <div className="pointer-events-none absolute inset-0 opacity-60" style={weave("#2f6b3f", "08")} />
        <div className="container-page relative py-12">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#2f6b3f]">
            Công trình thực tế
          </p>
          <h1 className="mt-3 font-serif text-4xl italic leading-tight text-[#1f4b2e] sm:text-5xl">
            {t.projects}
          </h1>
          <div className="mt-3 h-[3px] w-12" style={weave("#2f6b3f", "ff", 5)} />
          <p className="mt-4 max-w-xl leading-7 text-stone-600">
            Một số không gian đã lắp đặt nội thất mây tre, lục bình thực tế của xưởng —
            từ sân vườn, quán cafe đến khu nghỉ dưỡng.
          </p>
        </div>
      </section>

      {/* ---------------- BENTO GALLERY ---------------- */}
      <section className="container-page py-14">
        <div className="grid gap-4 md:grid-cols-3 md:auto-rows-[240px]">
          {projects.map((project, i) => (
            <article
              key={project.title}
              className={`group relative overflow-hidden rounded-md bg-stone-900 ${
                i === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
                className="object-cover transition duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <span className="absolute left-3 top-3 rounded-sm bg-[#2f6b3f]/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Dự án {String(i + 1).padStart(2, "0")}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h2 className={`font-serif text-white ${i === 0 ? "text-2xl md:text-3xl" : "text-lg"}`}>
                  {project.title}
                </h2>
                <p className="mt-1.5 max-w-md text-sm leading-6 text-white/85 line-clamp-2">
                  {project.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#1f4b2e]">
        <div className="container-page flex flex-col items-start gap-4 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#a9d7ab]">
              Bạn có không gian riêng?
            </p>
            <h2 className="mt-2 font-serif text-2xl italic text-white sm:text-3xl">
              Xưởng nhận thi công theo yêu cầu
            </h2>
          </div>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded bg-white px-5 text-sm font-bold text-[#1f4b2e] transition hover:bg-[#a9d7ab]"
          >
            Liên hệ tư vấn <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}