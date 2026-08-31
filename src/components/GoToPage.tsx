"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GoToPage({
  totalPages,
  makeHref,
}: {
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function goToPage() {
    const page = Number(value);
    if (!page || page < 1 || page > totalPages) return;
    router.push(makeHref(page));
    setValue("");
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={1}
        max={totalPages}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") goToPage();
        }}
        placeholder={`1-${totalPages}`}
        className="h-10 w-20 rounded border border-stone-300 px-2 text-center text-sm font-black"
      />
      <button
        type="button"
        onClick={goToPage}
        className="rounded border border-stone-300 bg-white px-4 py-2 text-sm font-black hover:border-[#2f6b3f]"
      >
        Tới trang
      </button>
    </div>
  );
}
