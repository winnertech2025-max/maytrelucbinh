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
const sourceHost = "maytrelucbinh.com";

if (!url || !serviceRole) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

class DisabledRealtimeSocket {
  constructor() {
    throw new Error("Realtime is disabled for this script.");
  }
}

const supabase = createClient(url, serviceRole, {
  auth: { persistSession: false },
  realtime: { transport: DisabledRealtimeSocket },
});

function canonicalImageUrl(imageUrl) {
  const [path, query] = imageUrl.split("?");
  const cleanPath = path
    .replace(/\.pagespeed\.ce\.[^.]+\.(?:jpe?g|png|webp|gif)$/i, "")
    .replace(/_(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)(?=\.(?:jpe?g|png|webp|gif)$)/i, "");
  return query ? `${cleanPath}?${query}` : cleanPath;
}

async function imageIsReachable(imageUrl) {
  const candidates = [...new Set([imageUrl, canonicalImageUrl(imageUrl)])];
  const headers = {
    accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    referer: "http://maytrelucbinh.com/",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  };

  for (const candidate of candidates) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
      const response = await fetch(encodeURI(candidate), {
        headers,
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("image/")) return true;
    } catch {
      // Try the next URL candidate.
    }
  }

  return false;
}

const { data: products, error } = await supabase
  .from("products")
  .select("id,slug,name,image,status")
  .ilike("image", `%${sourceHost}%`)
  .order("id", { ascending: true });

if (error) throw error;

console.log(`Checking ${products.length} products with old-domain images...`);

const hidden = [];
let stillReachable = 0;

for (const product of products) {
  const reachable = await imageIsReachable(product.image);
  if (reachable) {
    stillReachable += 1;
    console.log(`[OK] ${product.slug}`);
    continue;
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ status: "inactive" })
    .eq("id", product.id);

  if (updateError) throw updateError;
  hidden.push(product);
  console.log(`[HIDDEN] ${product.slug}`);
}

if (hidden.length > 0) {
  writeFileSync("hidden-broken-product-images.json", JSON.stringify(hidden, null, 2));
  console.log("Hidden list saved to hidden-broken-product-images.json");
}

console.log(`Done. Hidden: ${hidden.length}. Still reachable: ${stillReachable}.`);
