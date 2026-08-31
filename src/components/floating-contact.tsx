import { MessageCircle, Phone } from "lucide-react";

export function FloatingContact() {
  return (
    <div className="fixed bottom-4 right-4 z-50 hidden flex-col gap-2 sm:flex">
      <a
        href="tel:0964008356"
        className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2f6b3f] px-4 text-sm font-black text-white shadow-lg shadow-green-900/20"
      >
        <Phone size={16} /> Gọi mua
      </a>
      <a
        href="https://zalo.me/0964008356"
        target="_blank"
        className="inline-flex h-11 items-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-sm font-black text-[#2f6b3f] shadow-lg shadow-stone-300/40"
      >
        <MessageCircle size={16} /> Zalo
      </a>
    </div>
  );
}
