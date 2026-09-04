import * as cheerio from "cheerio";
import { writeFileSync } from "node:fs";

const baseUrl = "https://maytrelucbinh.com/";
const homeUrl = "https://maytrelucbinh.com/trang-chu.aspx";
const phone = "0934 086 085";

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function absoluteUrl(value) {
  if (!value) return "";
  return new URL(value.replace(/^\.\.\//, "").replace(/^\//, ""), baseUrl).toString();
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function slugFromHref(href, fallback = "") {
  const match = href.match(/\/([^/]+)\.aspx(?:[?#].*)?$/i);
  return match?.[1] || slugify(fallback);
}

async function fetchHtml(url, tries = 3) {
  let lastError = null;
  for (let i = 0; i < tries; i += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(35000),
        headers: {
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 700 * (i + 1)));
    }
  }
  throw lastError;
}

function extractCategories($) {
  const categories = new Map();
  $("a[href*='/chuyen-muc-sp/']").each((_, element) => {
    const href = $(element).attr("href") || "";
    const name = cleanText($(element).attr("title") || $(element).text());
    const slug = slugFromHref(href, name);
    if (!slug || slug === "san-pham" || !name) return;
    if (categories.has(slug)) return;
    categories.set(slug, {
      slug,
      name,
      nameEn: name,
      description: `${name} tại Mây Tre Lục Bình, nhận sản xuất theo kích thước và nhu cầu sử dụng.`,
      sortOrder: (categories.size + 1) * 10,
      status: "active",
    });
  });

  if (!categories.size) {
    categories.set("san-pham-khac", {
      slug: "san-pham-khac",
      name: "Sản phẩm khác",
      nameEn: "Other products",
      description: "Các sản phẩm mây tre lục bình theo yêu cầu.",
      sortOrder: 10,
      status: "active",
    });
  }
  return [...categories.values()];
}

function categoryFromUrl(url, categories) {
  const slug = slugFromHref(url);
  return categories.some((category) => category.slug === slug) ? slug : "";
}

function extractListUrls($, categories) {
  const urls = new Set([homeUrl, absoluteUrl("/chuyen-muc-sp/san-pham.aspx")]);
  for (const category of categories) urls.add(absoluteUrl(`/chuyen-muc-sp/${category.slug}.aspx`));
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href") || "";
    if (href.includes("/chuyen-muc-sp/")) urls.add(absoluteUrl(href));
  });
  return urls;
}

function extractProductCards($, category = "") {
  const products = [];
  $("a[href*='/tin-tuc-sp/']").each((_, element) => {
    const link = $(element);
    const href = link.attr("href") || "";
    const name =
      cleanText(link.attr("title")) ||
      cleanText(link.find("img").attr("alt")) ||
      cleanText(link.text()) ||
      cleanText(link.closest("li, .ProductList, div").find("a[href*='/tin-tuc-sp/']").last().text());
    const image = absoluteUrl(link.find("img[src*='/data/news/'], img[src*='../data/news/']").attr("src") || "");
    if (!href || !name || name.length < 3) return;
    products.push({
      detailUrl: absoluteUrl(href),
      slug: slugFromHref(href, name),
      name,
      image,
      category,
      price: `Liên hệ - ${phone}`,
    });
  });
  return products;
}

function extractPaginationUrls($) {
  const urls = new Set();
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href") || "";
    if (href.includes("/chuyen-muc-sp/") && /page|trang|p=|Page|ctl00/i.test(href)) urls.add(absoluteUrl(href));
  });
  return urls;
}

function extractGallery($) {
  const images = new Set();
  $("#ProductDetails a[rel='prodImage'], #ProductDetails a[rel*='prodImage'], a[href*='/data/news/']").each((_, element) => {
    const href = $(element).attr("href") || "";
    if (href.includes("/data/news/") || href.includes("../data/news/")) images.add(absoluteUrl(href).replace(/&width=\d+&height=\d+$/i, ""));
    const rel = $(element).attr("rel") || "";
    const largeMatch = rel.match(/largeimage&quot;:\s*&quot;([^&]+(?:&amp;width=\d+&amp;height=\d+)?)&quot;/i);
    if (largeMatch?.[1]) images.add(absoluteUrl(largeMatch[1].replace(/&amp;/g, "&")).replace(/&width=\d+&height=\d+$/i, ""));
  });
  $("#ProductDetails img[src*='/data/news/'], #ProductDetails img[src*='../data/news/']").each((_, element) => {
    images.add(absoluteUrl($(element).attr("src") || ""));
  });
  return [...images];
}

function extractDescription($) {
  const detail = $("#ProductDetails .Detail, #ProductDetails .ProductDescription, #ProductDetails").first().clone();
  detail.find("script, style, img, a, h1, .ProductThumb, .ProductThumbImage, .ProductDetailsThumb").remove();
  const text = cleanText(detail.text())
    .replace(/Giá Bán.*?(Liên hệ|VNĐ)/i, "")
    .replace(/Sản phẩm khác[\s\S]*$/i, "")
    .trim();
  if (text.length > 80) return text;
  const meta = cleanText($("meta[name='description'], meta[name='Description']").first().attr("content"));
  return meta.length > 40 ? meta : "";
}

function extractPrice($, fallback) {
  const text = cleanText($("#ProductDetails").text());
  const match = text.match(/Giá\s*Bán\s*[:\s]*([^Mô]+?)(?:Mô tả|$)/i);
  const value = cleanText(match?.[1] || "");
  return value || fallback || `Liên hệ - ${phone}`;
}

async function enrichProduct(product, index) {
  try {
    const html = await fetchHtml(product.detailUrl);
    const $ = cheerio.load(html);
    const title = cleanText($("#ProductDetails h1").first().text() || $("title").text().replace(/\s*-\s*Mây Tre.*$/i, "") || product.name);
    const gallery = extractGallery($);
    const image = gallery[0] || product.image;
    return {
      id: index + 1,
      slug: product.slug,
      name: title || product.name,
      image,
      images: gallery.length ? gallery : image ? [image] : [],
      category: product.category || "san-pham-khac",
      price: extractPrice($, product.price),
      salePrice: null,
      featured: index < 24,
      isNew: index < 36,
      description:
        extractDescription($) ||
        `${title || product.name} được sản xuất theo đơn đặt hàng tại Mây Tre Lục Bình, nhận làm theo kích thước và chất liệu yêu cầu.`,
      material: "Mây tre tự nhiên / lục bình / nhựa giả mây / khung sắt sơn tĩnh điện tùy mẫu",
      dimensions: "Sản xuất theo yêu cầu",
      status: image ? "active" : "inactive",
      oldDetailUrl: product.detailUrl,
    };
  } catch (error) {
    console.error(`[DETAIL FAILED] ${product.slug}: ${error instanceof Error ? error.message : String(error)}`);
    return {
      id: index + 1,
      slug: product.slug,
      name: product.name,
      image: product.image,
      images: product.image ? [product.image] : [],
      category: product.category || "san-pham-khac",
      price: product.price || `Liên hệ - ${phone}`,
      salePrice: null,
      featured: index < 24,
      isNew: index < 36,
      description: `${product.name} được sản xuất theo đơn đặt hàng tại Mây Tre Lục Bình, nhận làm theo kích thước và chất liệu yêu cầu.`,
      material: "Mây tre tự nhiên / lục bình / nhựa giả mây / khung sắt sơn tĩnh điện tùy mẫu",
      dimensions: "Sản xuất theo yêu cầu",
      status: product.image ? "active" : "inactive",
      oldDetailUrl: product.detailUrl,
    };
  }
}

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildSeedSql(categories, products) {
  const categoryRows = categories
    .map((category) =>
      `(${sqlString(category.slug)}, ${sqlString(category.name)}, ${sqlString(category.nameEn)}, ${sqlString(category.description)}, ${category.sortOrder}, ${sqlString(category.status)})`,
    )
    .join(",\n");

  const productRows = products
    .map((product) =>
      `(${product.id}, ${sqlString(product.slug)}, ${sqlString(product.name)}, ${sqlString(product.image)}, '${JSON.stringify(product.images || []).replace(/'/g, "''")}'::jsonb, ${sqlString(product.category)}, ${sqlString(product.price)}, ${sqlString(product.salePrice)}, ${product.featured}, ${product.isNew}, ${sqlString(product.description)}, ${sqlString(product.material)}, ${sqlString(product.dimensions)}, ${sqlString(product.status)})`,
    )
    .join(",\n");

  return `insert into public.categories (slug, name, name_en, description, sort_order, status) values\n${categoryRows}\non conflict (slug) do update set\nname = excluded.name,\nname_en = excluded.name_en,\ndescription = excluded.description,\nsort_order = excluded.sort_order,\nstatus = excluded.status,\nupdated_at = now();\n\ninsert into public.products (id, slug, name, image, images, category, price, sale_price, featured, is_new, description, material, dimensions, status) values\n${productRows}\non conflict (slug) do update set\nname = excluded.name,\nimage = excluded.image,\nimages = excluded.images,\ncategory = excluded.category,\nprice = excluded.price,\nsale_price = excluded.sale_price,\nfeatured = excluded.featured,\nis_new = excluded.is_new,\ndescription = excluded.description,\nmaterial = excluded.material,\ndimensions = excluded.dimensions,\nstatus = excluded.status,\nupdated_at = now();\n`;
}

function writeOutputs(categories, products) {
  const completeProducts = products.filter(Boolean);
  writeFileSync("src/lib/products.seed.json", JSON.stringify(completeProducts, null, 2));
  writeFileSync("supabase/seed.sql", buildSeedSql(categories, completeProducts));
  writeFileSync(
    "crawl-maytrelucbinh-report.json",
    JSON.stringify(
      {
        source: homeUrl,
        categories: categories.length,
        totalProducts: completeProducts.length,
        activeProducts: completeProducts.filter((product) => product.status === "active").length,
      },
      null,
      2,
    ),
  );
}

const homeHtml = await fetchHtml(homeUrl);
const home$ = cheerio.load(homeHtml);
const categories = extractCategories(home$);
const listUrls = extractListUrls(home$, categories);

for (const url of [...listUrls]) {
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    for (const nextUrl of extractPaginationUrls($)) listUrls.add(nextUrl);
  } catch (error) {
    console.error(`[PAGINATION FAILED] ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(`Scanning ${listUrls.size} list pages...`);

const found = new Map();
for (const url of listUrls) {
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    const category = categoryFromUrl(url, categories);
    for (const item of extractProductCards($, category)) {
      const existing = found.get(item.slug);
      found.set(item.slug, {
        ...existing,
        ...item,
        category: item.category || existing?.category || "san-pham-khac",
        image: item.image || existing?.image || "",
      });
    }
    console.log(`[LIST] ${url} -> ${found.size} products`);
  } catch (error) {
    console.error(`[LIST FAILED] ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const rawProducts = [...found.values()];
const products = new Array(rawProducts.length);
let cursor = 0;
let completed = 0;
const concurrency = Number(process.env.CRAWL_CONCURRENCY || 6);

async function worker() {
  while (cursor < rawProducts.length) {
    const index = cursor;
    cursor += 1;
    const product = await enrichProduct(rawProducts[index], index);
    products[index] = product;
    completed += 1;
    console.log(`[${completed}/${rawProducts.length}] ${product.slug}`);
    if (completed % 20 === 0) writeOutputs(categories, products);
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
writeOutputs(categories, products);

console.log(`Done. Categories: ${categories.length}. Products: ${products.length}. Active: ${products.filter((product) => product.status === "active").length}.`);
