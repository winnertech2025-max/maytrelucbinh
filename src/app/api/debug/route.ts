import { getSupabaseAdmin, hasSupabaseEnv } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const hasEnv = hasSupabaseEnv();
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ hasEnv, supabase: false });
  }

  const { data, error, count } = await supabase
    .from("products")
    .select("id,slug,status", { count: "exact" })
    .eq("status", "active")
    .limit(3);

  return NextResponse.json({
    hasEnv,
    supabase: true,
    error: error?.message || null,
    count,
    sample: data,
  });
}