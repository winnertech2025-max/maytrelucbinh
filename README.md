# Mây Tre Lục Bình - NextJS Rebuild

Website clone nội dung/chức năng cho `maytrelucbinh.com`, dựng lại bằng NextJS App Router, Supabase CMS, giỏ hàng và email đơn hàng.

## Chạy local

```bash
npm install
npm run dev
```

URL: `http://localhost:3000`

CMS demo: `/vi/admin`

Password demo: `demo-admin-2026`

## Luồng mua hàng

- Khách bấm `Đặt hàng` để thêm sản phẩm vào giỏ.
- Trang giỏ hàng cho sửa số lượng, xoá sản phẩm và chỉ hiện form khi bấm `Thanh toán`.
- Form thanh toán có 2 hình thức: `Thanh toán tại cửa hàng` và `Thanh toán khi nhận hàng`.
- Đơn hàng được lưu vào bảng `orders`, đồng thời gửi email báo đơn mới nếu đã cấu hình Resend.

## Supabase

1. Tạo project Supabase.
2. Chạy `supabase/schema.sql` trong SQL editor.
3. Chạy `supabase/seed.sql` để import dữ liệu sản phẩm đã crawl từ `https://maytrelucbinh.com/trang-chu.aspx`.
4. Copy `.env.example` thành `.env.local` và điền:

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_API_KEY=demo-admin-2026
```

Trang public có mock fallback để dev không bị chết trang khi chưa có DB. Riêng CRUD trong admin dùng Supabase thật và sẽ báo lỗi nếu thiếu env.

Data hiện tại được crawl từ `https://maytrelucbinh.com/trang-chu.aspx`: 20 danh mục, 373 sản phẩm, 372 sản phẩm active. Nếu khách cập nhật thêm sản phẩm ở web cũ, chạy lại:

```bash
npm run crawl:products
```

## CMS Admin

- Quản lý sản phẩm: thêm, sửa, xoá, bật sản phẩm mới/nổi bật.
- Quản lý danh mục: thêm, sửa, xoá, sắp xếp và bật/tắt trạng thái.
- Quản lý đơn hàng: tạo đơn tại chỗ cho nhân viên, chọn sản phẩm có sẵn hoặc nhập sản phẩm thủ công.
- Trạng thái đơn hàng: `Chờ`, `Nhận đơn`, `Chuẩn bị đơn`, `Chuẩn bị giao`, `Đang giao`, `Đã giao`, `Huỷ`.
- Khi đổi trạng thái, hệ thống gửi email cho khách nếu đơn có email và đã cấu hình Resend.

## Email Đặt Hàng

Form đặt hàng lưu DB trước, sau đó gửi email qua Resend nếu có:

```bash
RESEND_API_KEY=
ORDER_FROM_EMAIL=orders@maytrelucbinh.com
ORDER_TO_EMAIL=maytrelucbinh@gmail.com
```

Test cấu hình Resend sau khi điền key:

```bash
npm run test:email
```

## Tối Ưu Egress

- Server queries chỉ chọn cột cần dùng.
- Danh sách sản phẩm có `limit`, không tải toàn bộ DB.
- Route public dùng `revalidate = 600`.
- Ảnh render qua `next/image`.
- Mock seed local giúp trang vẫn hiển thị khi DB lỗi hoặc chưa cấu hình.
- Public chỉ hiện sản phẩm `active`, có thể ẩn sản phẩm ảnh lỗi khỏi người mua.

## Chuyển Ảnh Cũ Về Supabase Storage

Khi muốn bỏ phụ thuộc ảnh từ domain cũ, chạy:

```bash
npm run migrate:product-images
```

Script sẽ tải ảnh đang trỏ `maytrelucbinh.com`, upload lên bucket `product-images`, rồi update lại `products.image` trong Supabase. Ảnh nào link cũ đã 404 sẽ được báo `FAILED` để thay thủ công.
