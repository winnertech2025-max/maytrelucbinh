import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const bucketName = "product-images";
const maxFileSize = 4 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function isAuthed(request: Request) {
  const expected = process.env.ADMIN_API_KEY || "demo-admin-2026";
  return request.headers.get("x-admin-key") === expected;
}

function slugifyFilename(name: string) {
  const ext = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const base = name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${base || "product"}-${Date.now()}.${ext}`;
}

async function ensurePublicBucket(supabase: ReturnType<typeof getSupabaseAdmin>) {
  if (!supabase) return;
  const { data } = await supabase.storage.getBucket(bucketName);
  if (!data) {
    await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: maxFileSize,
      allowedMimeTypes: Array.from(allowedTypes),
    });
  }
}

export async function POST(request: Request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase env missing" }, { status: 500 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
  if (file.size > maxFileSize) return NextResponse.json({ error: "Image must be under 4MB" }, { status: 400 });

  await ensurePublicBucket(supabase);

  const folder = String(formData.get("folder") || "products").replace(/[^a-z0-9-]/gi, "") || "products";
  const path = `${folder}/${slugifyFilename(file.name)}`;
  const { error } = await supabase.storage.from(bucketName).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
