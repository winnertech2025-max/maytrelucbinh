"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setPending(true);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      fallbackTimer.current = setTimeout(() => setPending(false), 2200);
    }

    window.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("click", handleClick, true);
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setPending(false), 0);
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <>
      <div key={`${pathname}-${searchParams}`} className="route-progress fixed left-0 top-0 z-[100] h-1 bg-[#2f6b3f]" />
      {pending ? (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-[#fbfaf7]/72 backdrop-blur-[2px]">
          <div className="animate-route-card w-[min(360px,calc(100vw-32px))] rounded-md border border-stone-200 bg-white p-5 shadow-2xl shadow-stone-900/15">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-green-50 text-[#2f6b3f]">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div>
                <p className="text-sm font-black text-stone-900">Đang tải trang</p>
                <p className="mt-0.5 text-xs text-stone-500">Chuẩn bị nội dung mượt hơn cho bạn...</p>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-4/5 rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
