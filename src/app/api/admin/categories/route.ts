import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";

function isAuthed(request: Request) {
  const expected = process.env.ADMIN_API_KEY || "demo-admin-2026";
  return request.headers.get("x-admin-key") === expected;
}

const categorySchema = z.object({
  id: z.number().optional(),
  slug: z.string().min(2),
  name: z.string().min(2),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.coerce.number().default(100),
  status: z.enum(["active", "draft"]).default("active"),
});

export async function GET(request: Request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json([]);
  const { data, error } = await supabase
    .from("categories")
    .select("id,slug,name,nameEn:name_en,description,sortOrder:sort_order,status")
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = categorySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase env missing" }, { status: 500 });
  const category = parsed.data;
  const { error } = await supabase.from("categories").upsert({
    ...(category.id ? { id: category.id } : {}),
    slug: category.slug,
    name: category.name,
    name_en: category.nameEn || category.name,
    description: category.description || "",
    sort_order: category.sortOrder,
    status: category.status,
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
  const { error } = await supabase.from("categories").delete().in("slug", parsed.data.slugs);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
