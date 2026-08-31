"use client";

import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import { useMemo, useRef, useState, type MouseEvent } from "react";

interface ImageZoomProps {
  src: string;
  alt: string;
  images?: string[];
  zoom?: number;
}

export function ImageZoom({ src, alt, images = [], zoom = 2.4 }: ImageZoomProps) {
  const gallery = useMemo(() => [...new Set([src, ...images].filter(Boolean))], [images, src]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(gallery[0] || src);
  const [isHovering, setIsHovering] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [bgPos, setBgPos] = useState("50% 50%");

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setBgPos(`${x}% ${y}%`);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#1f5b35] shadow-sm ring-1 ring-black/5 transition hover:bg-white"
        aria-label="Phóng to ảnh"
      >
        <ZoomIn size={18} />
      </button>

      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        className="relative aspect-[250/247] w-full overflow-hidden rounded-2xl border border-[#e1e6da] bg-white shadow-sm"
      >
        <Image
          src={active}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 440px, 94vw"
          className="object-contain transition-transform duration-150 ease-out"
          style={{
            transform: isHovering ? `scale(${zoom})` : "scale(1)",
            transformOrigin: bgPos,
          }}
        />
        {isHovering && (
          <div
            className="pointer-events-none absolute hidden h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded border-2 border-[#2f6b3f]/75 bg-white/20 shadow-sm lg:block"
            style={{ left: bgPos.split(" ")[0], top: bgPos.split(" ")[1] }}
          />
        )}
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {gallery.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(image)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border bg-white transition ${
                active === image ? "border-[#2f6b3f] ring-2 ring-[#2f6b3f]/20" : "border-stone-200 hover:border-[#2f6b3f]"
              }`}
              aria-label={`Xem ảnh ${index + 1}`}
            >
              <Image src={image} alt={`${alt} ${index + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-stone-950/80 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-stone-900"
            aria-label="Đóng ảnh"
          >
            <X size={20} />
          </button>
          <div className="relative h-[82vh] w-full max-w-5xl">
            <Image src={active} alt={alt} fill sizes="95vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
