import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.PRODUCT_IMAGE_BUCKET || "product-images";
const sourceHost = "maytrelucbinh.com";

if (!url || !serviceRole) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

class DisabledRealtimeSocket {
  constructor() {
    throw new Error("Realtime is disabled for this migration script.");
  }
}

const supabase = createClient(url, serviceRole, {
  auth: { persistSession: false },
  realtime: { transport: DisabledRealtimeSocket },
});

function cleanName(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function extFrom(contentType, imageUrl) {
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("gif")) return "gif";
  const match = imageUrl.match(/\.(jpe?g|png|webp|gif)(?:\.|$|\?)/i);
  return match ? match[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

function canonicalImageUrl(imageUrl) {
  const [path, query] = imageUrl.split("?");
  const cleanPath = path
    .replace(/\.pagespeed\.ce\.[^.]+\.(?:jpe?g|png|webp|gif)$/i, "")
    .replace(/_(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)(?=\.(?:jpe?g|png|webp|gif)$)/i, "");
  return query ? `${cleanPath}?${query}` : cleanPath;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadImage(imageUrl) {
  const candidates = [...new Set([imageUrl, canonicalImageUrl(imageUrl)])];
  const headers = {
    accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    referer: "http://maytrelucbinh.com/",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  };
  let lastError = null;

  for (const candidate of candidates) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(encodeURI(candidate), { headers });
        if (!response.ok) throw new Error(`download ${response.status}`);

        const contentType = response.headers.get("content-type") || "image/jpeg";
        if (!contentType.includes("image/")) throw new Error(`invalid content-type ${contentType}`);

        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length < 256) throw new Error(`image too small ${buffer.length} bytes`);

        return { buffer, contentType, sourceUrl: candidate };
      } catch (error) {
        lastError = error;
        await sleep(250 * attempt);
      }
    }
  }

  throw lastError;
}

async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(bucket);
  if (!data) {
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 4 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (error) throw error;
  }
}

async function migrateOne(product) {
  const { buffer, contentType } = await downloadImage(product.image);
  const ext = extFrom(contentType, product.image);
  const filePath = `products/${product.id}-${cleanName(product.slug)}.${ext}`;

  const upload = await supabase.storage.from(bucket).upload(filePath, buffer, {
    cacheControl: "31536000",
    contentType,
    upsert: true,
  });
  if (upload.error) throw upload.error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  const update = await supabase.from("products").update({ image: data.publicUrl }).eq("id", product.id);
  if (update.error) throw update.error;
  return data.publicUrl;
}

await ensureBucket();

const { data: products, error } = await supabase
  .from("products")
  .select("id,slug,image")
  .ilike("image", `%${sourceHost}%`)
  .order("id", { ascending: true });

if (error) throw error;

console.log(`Found ${products.length} product images from ${sourceHost}`);
let ok = 0;
let failed = 0;
const failedProducts = [];

for (const product of products) {
  try {
    const publicUrl = await migrateOne(product);
    ok += 1;
    console.log(`[${ok}/${products.length}] ${product.slug} -> ${publicUrl}`);
  } catch (err) {
    failed += 1;
    const reason = err instanceof Error ? err.message : String(err);
    failedProducts.push({ id: product.id, slug: product.slug, image: product.image, reason });
    console.error(`[FAILED] ${product.slug}: ${reason}`);
  }
}

if (failedProducts.length > 0) {
  writeFileSync("failed-product-images.json", JSON.stringify(failedProducts, null, 2));
  console.log("Failed list saved to failed-product-images.json");
}

console.log(`Done. Success: ${ok}. Failed: ${failed}.`);
