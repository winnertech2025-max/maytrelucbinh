import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { saveOrder } from "@/lib/data";

const orderSchema = z.object({
  customer_name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  note: z.string().optional(),
  product_slug: z.string().optional(),
  product_name: z.string().optional(),
  quantity: z.coerce.number().min(1).default(1),
  payment_method: z.enum(["store", "cod"]).default("cod"),
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
    .min(1)
    .optional(),
});

export async function POST(request: Request) {
  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }

  const order = {
    ...parsed.data,
    status: "pending" as const,
    product_name:
      parsed.data.product_name || parsed.data.items?.map((item) => item.product_name).join(", ") || "Đơn hàng",
    quantity: parsed.data.quantity || parsed.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 1,
  };

  let saved: { id?: string };
  try {
    saved = await saveOrder(order);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cannot save order" },
      { status: 500 },
    );
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.ORDER_FROM_EMAIL || "orders@maytrelucbinh.com",
        to: process.env.ORDER_TO_EMAIL || "maytrelucbinh@gmail.com",
        subject: `Đơn hàng mới: ${order.product_name || "Liên hệ chung"}`,
        text: [
          `Khách: ${order.customer_name}`,
          `SĐT: ${order.phone}`,
          `Email: ${order.email || "-"}`,
          `Địa chỉ: ${order.address || "-"}`,
          `Thanh toán: ${order.payment_method === "store" ? "Thanh toán tại cửa hàng" : "Thanh toán khi nhận hàng"}`,
          `Sản phẩm: ${order.items?.map((item) => `${item.product_name} x ${item.quantity}`).join("; ") || order.product_name || "-"}`,
          `Số lượng: ${order.quantity}`,
          `Ghi chú: ${order.note || "-"}`,
        ].join("\n"),
      });
    } catch {
      // Order is already saved; email failure should not break the customer checkout.
    }
  }

  return NextResponse.json({ ok: true, id: saved.id });
}
