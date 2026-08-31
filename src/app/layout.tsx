import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mây Tre Lục Bình - Nội thất mây tre đan",
    template: "%s | Mây Tre Lục Bình",
  },
  description:
    "Xưởng sản xuất nội thất mây tre đan, bàn ghế nhựa giả mây, sofa mây, bình phong, xích đu và sản phẩm decor tại TP HCM.",
  metadataBase: new URL("https://maytrelucbinh.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" data-scroll-behavior="smooth" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
