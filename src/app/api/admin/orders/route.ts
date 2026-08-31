import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { listOrders, saveOrder } from "@/lib/data";
import { getSupabaseAdmin } from "@/lib/supabase";

function isAuthed(request: Request) {
  const expected = process.env.ADMIN_API_KEY || "demo-admin-2026";
  return request.headers.get("x-admin-key") === expected;
}

export async function GET(request: Request) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await listOrders());
}

const adminOrderSchema = z.object({
  customer_name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  note: z.string().optional(),
  payment_method: z.enum(["store", "cod"]).default("store"),
  items: z
    .array(
      z.object({
        product_slug: z.string().optional(),
        product_name: z.string().min(1),
        image: z.string().optional(),
        price: z.string().optional(),
        quantity: z.coerce.number().min(1),
      }),
    )
    .min(1),
});

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "accepted", "preparing", "ready_to_ship", "shipping", "delivered", "cancelled"]),
});

const deleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

const statusLabel: Record<string, string> = {
  pending: "Chờ",
  accepted: "Nhận đơn",
  preparing: "Chuẩn bị đơn",
  ready_to_ship: "Chuẩn bị giao",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Huỷ",
};

async function sendStatusEmail(to: string | undefined, status: string, orderId: string) {
  if (!to || !process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.ORDER_FROM_EMAIL || "orders@maytrelucbinh.com",
    to,
    subject: `Cập nhật đơn hàng ${orderId}`,
    text: `Đơn hàng của bạn đã chuyển sang trạng thái: ${statusLabel[status] || status}.`,
  });
}

export async function POST(request: Request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = adminOrderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid order" }, { status: 400 });

  const order = {
    ...parsed.data,
    status: "accepted" as const,
    product_name: parsed.data.items.map((item) => item.product_name).join(", "),
    quantity: parsed.data.items.reduce((sum, item) => sum + item.quantity, 0),
  };
  const saved = await saveOrder(order);
  return NextResponse.json({ ok: true, id: saved.id });
}

export async function PATCH(request: Request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase env missing" }, { status: 500 });

  const { data: current } = await supabase.from("orders").select("email").eq("id", parsed.data.id).maybeSingle();
  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await sendStatusEmail(current?.email, parsed.data.status, parsed.data.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isAuthed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = deleteSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid order ids" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabase env missing" }, { status: 500 });

  const { error } = await supabase.from("orders").delete().in("id", parsed.data.ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
