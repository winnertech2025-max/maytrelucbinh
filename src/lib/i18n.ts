import type { Locale } from "./types";

export type { Locale };

export const locales: Locale[] = ["vi", "en"];

export function asLocale(value: string | undefined): Locale {
  return value === "en" ? "en" : "vi";
}

export const dict = {
  vi: {
    home: "Trang chủ",
    about: "Giới thiệu",
    products: "Sản phẩm",
    projects: "Dự án",
    contact: "Liên hệ",
    admin: "CMS",
    search: "Tìm sản phẩm, mã hàng...",
    newProducts: "Sản phẩm mới",
    featuredProducts: "Sản phẩm nổi bật",
    viewAll: "Xem thêm sản phẩm",
    orderNow: "Đặt hàng",
    quote: "Liên hệ báo giá",
    categories: "Danh mục",
    all: "Tất cả",
    hotline: "Hotline",
    email: "Email",
    address: "253 đường Bạch Đằng, Phường 15, Quận Bình Thạnh, TP HCM",
    heroTitle: "CÔNG TY TNHH NỘI THẤT MÂY TRE LỤC BÌNH",
    heroText:
      "Xưởng sản xuất nội thất mây tre đan, bàn ghế nhựa giả mây, sofa sân vườn, bình phong và vật dụng decor theo yêu cầu.",
    submitOrder: "Gửi yêu cầu",
    customerName: "Họ tên",
    phone: "Số điện thoại",
    note: "Nhu cầu / ghi chú",
  },
  en: {
    home: "Home",
    about: "About",
    products: "Products",
    projects: "Projects",
    contact: "Contact",
    admin: "CMS",
    search: "Search product or code...",
    newProducts: "New products",
    featuredProducts: "Featured products",
    viewAll: "View products",
    orderNow: "Order",
    quote: "Request quote",
    categories: "Categories",
    all: "All",
    hotline: "Hotline",
    email: "Email",
    address: "253 Bach Dang St, Ward 15, Binh Thanh District, HCMC",
    heroTitle: "MAY TRE LUC BINH FURNITURE CO., LTD",
    heroText:
      "Manufacturer of rattan furniture, wicker outdoor sets, garden sofas, screens and custom decor items.",
    submitOrder: "Send request",
    customerName: "Full name",
    phone: "Phone",
    note: "Request / note",
  },
} satisfies Record<Locale, Record<string, string>>;
