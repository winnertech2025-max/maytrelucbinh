import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";

const productSchema = z.object({
  id: z.number().optional(),
  slug: z.string().min(2),
  name: z.string().min(2),
  image: z.string().url(),
  images: z.array(z.string().url()).optional(),
  category: z.string().min(2),
  price: z.string().min(1),
  salePrice: z.string().optional(),
  featured: z.boolean(),
  isNew: z.boolean(),
  description: z.string().optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
});

function isAuthed(request: Request) {
  const expected = process.env.ADMIN_API_KEY || "demo-admin-2026";
  return request.headers.get("x-admin-key") === expected;
}

export async function POST(request: Request) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase env missing" }, { status: 500 });
  }

  const product = parsed.data;
  const { error } = await supabase.from("products").upsert({
    ...(product.id ? { id: product.id } : {}),
    slug: product.slug,
    name: product.name,
    image: product.image,
    images: product.images || [],
    category: product.category,
    price: product.price,
    sale_price: product.salePrice || null,
    featured: product.featured,
    is_new: product.isNew,
    description: product.description,
    material: product.material,
    dimensions: product.dimensions,
    status: "active",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z.object({ slugs: z.array(z.string()).min(1) }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid slugs" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase env missing" }, { status: 500 });
  const { error } = await supabase.from("products").delete().in("slug", parsed.data.slugs);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
