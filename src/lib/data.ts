import { cache } from "react";
import path from "path";
import { categories as mockCategories, products as mockProducts, projects } from "./mock-data";
import { getSupabaseAdmin } from "./supabase";
import type { Order, Product } from "./types";

const productColumns =
  "id,slug,name,image,images,category,price,salePrice:sale_price,featured,isNew:is_new,description,material,dimensions,status,created_at,updated_at";
const productColumnsFallback =
  "id,slug,name,image,category,price,salePrice:sale_price,featured,isNew:is_new,description,material,dimensions,status,created_at,updated_at";
const categoryColumns = "id,slug,name,nameEn:name_en,description,sortOrder:sort_order,status";

function hasMissingImagesColumn(error: { message?: string } | null) {
  return Boolean(error?.message?.includes("images"));
}

export const getCategories = cache(async () => {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select(categoryColumns)
      .eq("status", "active")
      .order("sort_order", { ascending: true });
    if (!error && data) return data;
  }
  return mockCategories;
});

export const getProducts = cache(
  async ({
    category,
    limit = 24,
    page = 1,
    query,
    sort = "newest",
  }: {
    category?: string;
    limit?: number;
    page?: number;
    query?: string;
    sort?: "newest" | "oldest" | "name";
  } = {}) => {
    const supabase = getSupabaseAdmin();
    const from = Math.max(0, (page - 1) * limit);
    const to = from + limit - 1;

    if (supabase) {
      let request = supabase
        .from("products")
        .select(productColumns, { count: "exact" })
        .eq("status", "active");

      if (sort === "oldest") request = request.order("created_at", { ascending: true }).order("id", { ascending: true });
      else if (sort === "name") request = request.order("name", { ascending: true });
      else request = request.order("created_at", { ascending: false }).order("id", { ascending: false });

      request = request.range(from, to);

      if (category) request = request.eq("category", category);
      if (query) request = request.ilike("name", `%${query}%`);

      const { data, error } = await request;
      if (!error && data) return data as Product[];

      if (hasMissingImagesColumn(error)) {
        let fallbackRequest = supabase
          .from("products")
          .select(productColumnsFallback, { count: "exact" })
          .eq("status", "active");

        if (sort === "oldest") fallbackRequest = fallbackRequest.order("created_at", { ascending: true }).order("id", { ascending: true });
        else if (sort === "name") fallbackRequest = fallbackRequest.order("name", { ascending: true });
        else fallbackRequest = fallbackRequest.order("created_at", { ascending: false }).order("id", { ascending: false });

        fallbackRequest = fallbackRequest.range(from, to);

        if (category) fallbackRequest = fallbackRequest.eq("category", category);
        if (query) fallbackRequest = fallbackRequest.ilike("name", `%${query}%`);

        const fallback = await fallbackRequest;
        if (!fallback.error && fallback.data) return fallback.data as Product[];
      }
    }

    return mockProducts
      .filter((product) => product.status === "active")
      .filter((product) => !category || product.category === category)
      .filter((product) => !query || product.name.toLowerCase().includes(query.toLowerCase()))
      .slice(from, to + 1);
  },
);

export const getProductsPage = cache(
  async ({
    category,
    limit = 12,
    page = 1,
    query,
    sort = "newest",
  }: {
    category?: string;
    limit?: number;
    page?: number;
    query?: string;
    sort?: "newest" | "oldest" | "name";
  } = {}) => {
    const supabase = getSupabaseAdmin();
    const from = Math.max(0, (page - 1) * limit);
    const to = from + limit - 1;

    if (supabase) {
      let request = supabase
        .from("products")
        .select(productColumns, { count: "exact" })
        .eq("status", "active");

      if (sort === "oldest") request = request.order("created_at", { ascending: true }).order("id", { ascending: true });
      else if (sort === "name") request = request.order("name", { ascending: true });
      else request = request.order("created_at", { ascending: false }).order("id", { ascending: false });

      request = request.range(from, to);

      if (category) request = request.eq("category", category);
      if (query) request = request.ilike("name", `%${query}%`);

      const { data, count, error } = await request;

      if (!error && data) {
        return {
          products: data as Product[],
          total: count || 0,
          page,
          totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
        };
      }

      if (hasMissingImagesColumn(error)) {
        let fallbackRequest = supabase
          .from("products")
          .select(productColumnsFallback, { count: "exact" })
          .eq("status", "active");

        if (sort === "oldest") fallbackRequest = fallbackRequest.order("created_at", { ascending: true }).order("id", { ascending: true });
        else if (sort === "name") fallbackRequest = fallbackRequest.order("name", { ascending: true });
        else fallbackRequest = fallbackRequest.order("created_at", { ascending: false }).order("id", { ascending: false });

        fallbackRequest = fallbackRequest.range(from, to);

        if (category) fallbackRequest = fallbackRequest.eq("category", category);
        if (query) fallbackRequest = fallbackRequest.ilike("name", `%${query}%`);

        const fallback = await fallbackRequest;
        if (!fallback.error && fallback.data) {
          return {
            products: fallback.data as Product[],
            total: fallback.count || 0,
            page,
            totalPages: Math.max(1, Math.ceil((fallback.count || 0) / limit)),
          };
        }
      }
    }

    const filtered = mockProducts
      .filter((product) => product.status === "active")
      .filter((product) => !category || product.category === category)
      .filter((product) => !query || product.name.toLowerCase().includes(query.toLowerCase()));
    if (sort === "oldest") filtered.reverse();
    if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

    return {
      products: filtered.slice(from, to + 1),
      total: filtered.length,
      page,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    };
  },
);

export const getAdminProducts = cache(async () => {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select(productColumns)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(1000);
    if (!error && data) return data as Product[];

    if (hasMissingImagesColumn(error)) {
      const fallback = await supabase
        .from("products")
        .select(productColumnsFallback)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(1000);
      if (!fallback.error && fallback.data) return fallback.data as Product[];
    }
  }

  return mockProducts;
});

export const getProductBySlug = cache(async (slug: string) => {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase.from("products").select(productColumns).eq("slug", slug).eq("status", "active").maybeSingle();
    if (hasMissingImagesColumn(error)) {
      const fallback = await supabase
        .from("products")
        .select(productColumnsFallback)
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();
      return (fallback.data as Product | null) || null;
    }
    return (data as Product | null) || null;
  }

  return mockProducts.find((product) => product.slug === slug && product.status === "active") || null;
});

export async function listOrders() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    try {
      const fs = await import("fs/promises");
      const file = path.join(process.cwd(), ".local", "orders.json");
      const content = await fs.readFile(file, "utf8");
      return JSON.parse(content) as Order[];
    } catch {
      return [] as Order[];
    }
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id,customer_name,phone,email,address,note,product_slug,product_name,quantity,items,payment_method,status,revenue_amount,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    const fallback = await supabase
      .from("orders")
      .select("id,customer_name,phone,email,address,note,product_slug,product_name,quantity,items,payment_method,status,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (fallback.error) return [] as Order[];
    return fallback.data as Order[];
  }
  return data as Order[];
}

export async function saveOrder(order: Order) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const fs = await import("fs/promises");
    const dir = path.join(process.cwd(), ".local");
    const file = path.join(dir, "orders.json");
    await fs.mkdir(dir, { recursive: true });
    const current = await listOrders();
    const saved = {
      ...order,
      id: `mock-${Date.now()}`,
      status: order.status || "pending",
      created_at: new Date().toISOString(),
    };
    await fs.writeFile(file, JSON.stringify([saved, ...current].slice(0, 200), null, 2));
    return { id: saved.id };
  }

  const { data, error } = await supabase.from("orders").insert(order).select("id").single();
  if (error) throw error;
  return data;
}

export { mockProducts, projects };
