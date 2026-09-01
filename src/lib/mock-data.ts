import productsSeed from "./products.seed.json";
import type { Category, Product } from "./types";

export const categories: Category[] = [
  {
    slug: "ban-ghe-nhua-gia-may",
    name: "Bàn ghế nhựa giả mây",
    nameEn: "Synthetic rattan sets",
    description: "Sofa, bàn ghế cafe, ghế hồ bơi, xích đu và đồ dùng ngoài trời.",
  },
  {
    slug: "ban-ghe-may-tu-nhien",
    name: "Bàn ghế mây tự nhiên",
    nameEn: "Natural rattan furniture",
    description: "Sofa, bàn ghế ăn, ghế bập bênh và bộ phòng khách mây tự nhiên.",
  },
  {
    slug: "ghe-may-tre",
    name: "Ghế mây tre",
    nameEn: "Bamboo rattan chairs",
    description: "Ghế nhà hàng, ghế thư giãn, ghế decor và ghế đọc sách.",
  },
  {
    slug: "binh-phong-may-tre",
    name: "Bình phong mây tre",
    nameEn: "Rattan screens",
    description: "Bình phong trang trí cho studio, nhà hàng, resort và nhà ở.",
  },
  {
    slug: "xich-du-may",
    name: "Xích đu mây",
    nameEn: "Rattan swings",
    description: "Xích đu đơn, xích đu đôi, treo trần và khung ngoài trời.",
  },
  {
    slug: "tam-may-dan-tam-nhua-dan",
    name: "Tấm mây đan - tấm nhựa đan",
    nameEn: "Woven cane panels",
    description: "Lưới mây, tấm ốp trần, vật liệu decor và hoàn thiện nội thất.",
  },
  {
    slug: "sot-dung-do-may-tre",
    name: "Sọt đựng đồ mây tre",
    nameEn: "Wicker baskets",
    description: "Giỏ quà, khay trưng bày, sọt trái cây cho siêu thị và nhà hàng.",
  },
  {
    slug: "ghe-to-chim-check-in",
    name: "Ghế tổ chim check in",
    nameEn: "Photo spot nest chairs",
    description: "Ghế tổ chim, trái tim, ngôi sao cho khu du lịch và bãi biển.",
  },
  {
    slug: "giuong-tu-may",
    name: "Giường, tủ, vật dụng mây",
    nameEn: "Rattan beds and cabinets",
    description: "Giường công chúa, tủ, khung gương và đồ dùng mây tự nhiên.",
  },
  {
    slug: "sofa-may",
    name: "Sofa mây",
    nameEn: "Rattan sofas",
    description: "Sofa phòng khách, sofa góc, sofa sân vườn và sofa trứng.",
  },
  {
    slug: "san-pham-khac",
    name: "Sản phẩm khác",
    nameEn: "Other products",
    description: "Các mẫu decor và sản phẩm thủ công theo yêu cầu.",
  },
];

const seedProducts = productsSeed as Product[];
const fallbackProducts = seedProducts.some((product) => product.status === "active")
  ? seedProducts
  : seedProducts.slice(0, 12).map((product) => ({
      ...product,
      image: "/BannerHero.png",
      images: ["/BannerHero.png"],
      status: "active" as const,
    }));

export const products: Product[] = fallbackProducts.map((product) => ({
  ...product,
  description:
    product.description ||
    `${product.name} được sản xuất theo đơn đặt hàng tại xưởng Mây Tre Lục Bình, có thể tùy chỉnh kích thước, màu mây, nệm và vật liệu khung theo không gian sử dụng.`,
  material: product.material || "Mây tre tự nhiên / nhựa giả mây cao cấp / khung sắt sơn tĩnh điện tùy mẫu",
  dimensions: product.dimensions || "Sản xuất theo yêu cầu",
  status: product.status || "active",
}));

export const projects = [
  {
    title: "Thi công bàn ghế mây tre cho quán cafe sân vườn",
    image: products[3]?.image,
    description: "Bộ bàn ghế nhựa giả mây tối ưu cho không gian ngoài trời, dễ vệ sinh và bền nắng mưa.",
  },
  {
    title: "Decor resort với ghế tổ chim check in",
    image: products[5]?.image,
    description: "Các mẫu tổ chim, khung trái tim và ghế treo tạo điểm chụp hình nổi bật.",
  },
  {
    title: "Nội thất phòng khách phong cách mộc",
    image: products[1]?.image,
    description: "Sofa mây tự nhiên kết hợp nệm dày, phù hợp nhà phố, homestay và studio.",
  },
];
