import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";

function isAuthed(request: Request) {
  const expected = process.env.ADMIN_API_KEY || "demo-admin-2026";
  return request.headers.get("x-admin-key") === expected;
}

const revenueSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.coerce.number().int().min(0),
});

export async function POST(request: Request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = revenueSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid revenue" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase env missing" }, { status: 500 });

  const { error } = await supabase
    .from("orders")
    .update({ revenue_amount: parsed.data.amount, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.orderId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
