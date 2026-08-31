"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Boxes,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Eye,
  Package,
  Plus,
  Save,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import type { Category, Order, OrderStatus, PaymentMethod, Product } from "@/lib/types";

const demoPassword = "demo-admin-2026";
const PAGE_SIZE = 8;

type Tab = "overview" | "products" | "categories" | "orders";
type SortKey = "name" | "price";
type SortDir = "asc" | "desc";
type ProductSortMode = "newest" | "oldest" | "name_asc" | "name_desc" | "price_asc" | "price_desc";
type OrderSortMode = "newest" | "oldest";
type EditorMode = "create" | "edit";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function orderKey(order: Order) {
  return order.id || `${order.phone}-${order.created_at}`;
}

function blankProduct(): Product {
  return {
    slug: "",
    name: "",
    price: "",
    category: "",
    image: "",
    description: "",
    featured: false,
    isNew: true,
  } as Product;
}

function categoryLabel(categories: Category[], slug: string) {
  return categories.find((category) => category.slug === slug)?.name || slug;
}

function blankCategory(): Category {
  return { slug: "", name: "", nameEn: "", description: "", sortOrder: 100, status: "active" };
}

const orderStatuses: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Chờ" },
  { value: "accepted", label: "Nhận đơn" },
  { value: "preparing", label: "Chuẩn bị đơn" },
  { value: "ready_to_ship", label: "Chuẩn bị giao" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Huỷ" },
];

export function AdminDashboard({
  initialProducts,
  initialCategories,
}: {
  initialProducts: Product[];
  initialCategories: Category[];
}) {
  // ---------------- auth ----------------
  const [password, setPassword] = useState(demoPassword);
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState("");

  // ---------------- data ----------------
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [revenue, setRevenue] = useState<Record<string, number>>({});

  // ---------------- ui state ----------------
  const [tab, setTab] = useState<Tab>("overview");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [productFlagFilter, setProductFlagFilter] = useState("");
  const [productSort, setProductSort] = useState<ProductSortMode>("newest");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [orderSort, setOrderSort] = useState<OrderSortMode>("newest");
  const [page, setPage] = useState(1);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
  const [revenueOrder, setRevenueOrder] = useState<Order | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);

  async function loadOrders(key = password) {
    const response = await fetch("/api/admin/orders", { headers: { "x-admin-key": key } });
    if (response.ok) {
      const loadedOrders = (await response.json()) as Order[];
      setOrders(loadedOrders);
      setRevenue(
        Object.fromEntries(
          loadedOrders
            .filter((order) => typeof order.revenue_amount === "number" && order.revenue_amount > 0)
            .map((order) => [orderKey(order), order.revenue_amount || 0]),
        ),
      );
      setOrdersLoaded(true);
    }
  }

  async function loadCategories(key = password) {
    const response = await fetch("/api/admin/categories", { headers: { "x-admin-key": key } });
    if (response.ok) setCategories(await response.json());
  }

  async function login() {
    if (!password) return;
    setLoginError("");
    const response = await fetch("/api/admin/orders", { headers: { "x-admin-key": password } });
    if (response.ok) {
      const loadedOrders = (await response.json()) as Order[];
      setAuthed(true);
      setOrders(loadedOrders);
      setRevenue(
        Object.fromEntries(
          loadedOrders
            .filter((order) => typeof order.revenue_amount === "number" && order.revenue_amount > 0)
            .map((order) => [orderKey(order), order.revenue_amount || 0]),
        ),
      );
      setOrdersLoaded(true);
      loadCategories(password);
    } else {
      setLoginError("Sai mật khẩu hoặc chưa cấu hình admin key.");
    }
  }

  function logout() {
    setAuthed(false);
    setPassword("");
  }

  // ---------------- product create / edit ----------------
  function openCreateProduct() {
    setEditorMode("create");
    setEditing(blankProduct());
  }

  function openEditProduct(product: Product) {
    setEditorMode("edit");
    setEditing(product);
  }

  async function saveProduct(payload: Product) {
    const isCreate = editorMode === "create";
    const finalPayload: Product = isCreate
      ? { ...payload, slug: payload.slug.trim() || slugify(payload.name) }
      : payload;

    if (isCreate && !finalPayload.slug) {
      setMessage("Cần nhập tên sản phẩm để tạo slug.");
      return;
    }
    if (isCreate && products.some((p) => p.slug === finalPayload.slug)) {
      setMessage("Slug này đã tồn tại, hãy đổi tên hoặc slug khác.");
      return;
    }

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": password },
      body: JSON.stringify(finalPayload),
    });

    if (response.ok) {
      const savedProduct = { ...finalPayload, id: finalPayload.id || Date.now() };
      setProducts((items) =>
        isCreate ? [savedProduct, ...items] : items.map((item) => (item.slug === savedProduct.slug ? savedProduct : item))
      );
      setMessage(isCreate ? "Đã thêm sản phẩm mới." : "Đã lưu sản phẩm.");
      setEditing(null);
    } else {
      setMessage("Chưa lưu được. Kiểm tra Supabase env hoặc admin key.");
    }
  }

  async function saveCategory(category: Category) {
    const finalCategory = { ...category, slug: category.slug.trim() || slugify(category.name) };
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": password },
      body: JSON.stringify(finalCategory),
    });
    if (response.ok) {
      const saved = { ...finalCategory, id: finalCategory.id || Date.now() };
      setCategories((items) => {
        const exists = items.some((item) => item.slug === saved.slug);
        return exists ? items.map((item) => (item.slug === saved.slug ? saved : item)) : [...items, saved];
      });
      setEditingCategory(null);
      setMessage("Đã lưu danh mục.");
    } else {
      setMessage("Chưa lưu được danh mục. Kiểm tra Supabase env hoặc admin key.");
    }
  }

  async function deleteCategory(slug: string) {
    if (!window.confirm("Xoá danh mục này?")) return;
    const response = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-key": password },
      body: JSON.stringify({ slugs: [slug] }),
    });
    if (response.ok) {
      setCategories((items) => items.filter((item) => item.slug !== slug));
      setMessage("Đã xoá danh mục.");
    } else {
      setMessage("Chưa xoá được danh mục.");
    }
  }

  async function createAdminOrder(order: Order) {
    const response = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": password },
      body: JSON.stringify(order),
    });
    if (response.ok) {
      await loadOrders();
      setCreateOrderOpen(false);
      setMessage("Đã tạo đơn hàng tại chỗ.");
    } else {
      setMessage("Chưa tạo được đơn hàng.");
    }
  }

  async function updateOrderStatus(order: Order, status: OrderStatus) {
    if (!order.id) return;
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": password },
      body: JSON.stringify({ id: order.id, status }),
    });
    if (response.ok) {
      setOrders((items) => items.map((item) => (item.id === order.id ? { ...item, status } : item)));
      setMessage("Đã cập nhật trạng thái đơn hàng.");
    } else {
      setMessage("Chưa cập nhật được trạng thái.");
    }
  }

  // ---------------- product delete ----------------
  async function deleteProducts(slugs: string[]) {
    if (slugs.length === 0) return;
    const confirmed = window.confirm(
      slugs.length === 1
        ? "Xoá sản phẩm này? Không thể hoàn tác."
        : `Xoá ${slugs.length} sản phẩm đã chọn? Không thể hoàn tác.`
    );
    if (!confirmed) return;

    const response = await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-key": password },
      body: JSON.stringify({ slugs }),
    });

    if (response.ok) {
      setProducts((items) => items.filter((item) => !slugs.includes(item.slug)));
      setSelectedSlugs((set) => {
        const next = new Set(set);
        slugs.forEach((slug) => next.delete(slug));
        return next;
      });
      setMessage(slugs.length === 1 ? "Đã xoá sản phẩm." : `Đã xoá ${slugs.length} sản phẩm.`);
    } else {
      setMessage("Chưa xoá được. Kiểm tra API /api/admin/products (DELETE).");
    }
  }

  // ---------------- revenue ----------------
  async function saveRevenue(order: Order, amount: number) {
    const key = orderKey(order);
    const response = await fetch("/api/admin/revenue", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": password },
      body: JSON.stringify({ orderId: order.id, amount }),
    });

    if (response.ok) {
      setRevenue((r) => ({ ...r, [key]: amount }));
      setOrders((items) => items.map((item) => (item.id === order.id ? { ...item, revenue_amount: amount } : item)));
      setMessage("Đã ghi nhận doanh thu.");
      setRevenueOrder(null);
    } else {
      setMessage("Chưa ghi được doanh thu. Kiểm tra API /api/admin/revenue.");
    }
  }

  async function deleteOrder(order: Order) {
    if (!order.id) return;
    const confirmed = window.confirm(`Xoá đơn hàng của ${order.customer_name}? Không thể hoàn tác.`);
    if (!confirmed) return;
    const response = await fetch("/api/admin/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-key": password },
      body: JSON.stringify({ ids: [order.id] }),
    });
    if (response.ok) {
      setOrders((items) => items.filter((item) => item.id !== order.id));
      setRevenue((items) => {
        const next = { ...items };
        delete next[orderKey(order)];
        return next;
      });
      setDetailOrder(null);
      setMessage("Đã xoá đơn hàng.");
    } else {
      setMessage("Chưa xoá được đơn hàng. Kiểm tra API /api/admin/orders.");
    }
  }

  const totalRevenue = useMemo(() => Object.values(revenue).reduce((a, b) => a + b, 0), [revenue]);

  // ---------------- derived product list ----------------
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = products.filter((p) => {
      const matchesTerm = !term || p.name.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term) || p.category.toLowerCase().includes(term);
      const matchesCategory = !productCategoryFilter || p.category === productCategoryFilter;
      const matchesFlag =
        !productFlagFilter ||
        (productFlagFilter === "featured" && p.featured) ||
        (productFlagFilter === "new" && p.isNew) ||
        (productFlagFilter === "normal" && !p.featured && !p.isNew);
      return matchesTerm && matchesCategory && matchesFlag;
    });
    return [...filtered].sort((a, b) => {
      if (productSort === "oldest") return Date.parse(a.created_at || "1970-01-01") - Date.parse(b.created_at || "1970-01-01");
      if (productSort === "name_asc") return a.name.localeCompare(b.name);
      if (productSort === "name_desc") return b.name.localeCompare(a.name);
      if (productSort === "price_asc" || productSort === "price_desc") {
        const pa = parseFloat(String(a.price).replace(/[^\d.]/g, "")) || 0;
        const pb = parseFloat(String(b.price).replace(/[^\d.]/g, "")) || 0;
        return productSort === "price_asc" ? pa - pb : pb - pa;
      }
      return Date.parse(b.created_at || "1970-01-01") - Date.parse(a.created_at || "1970-01-01");
    });
  }, [products, search, productCategoryFilter, productFlagFilter, productSort]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    setPage(1);
    if (sortKey === key) {
      const next = sortDir === "asc" ? "desc" : "asc";
      setSortDir(next);
      setProductSort(key === "name" ? (next === "asc" ? "name_asc" : "name_desc") : (next === "asc" ? "price_asc" : "price_desc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
      setProductSort(key === "name" ? "name_asc" : "price_asc");
    }
  }

  function toggleRow(slug: string) {
    setSelectedSlugs((set) => {
      const next = new Set(set);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleAllRows() {
    setSelectedSlugs((set) =>
      set.size === pagedProducts.length ? new Set() : new Set(pagedProducts.map((p) => p.slug))
    );
  }

  const stats = {
    total: products.length,
    featured: products.filter((p) => p.featured).length,
    isNew: products.filter((p) => p.isNew).length,
    orders: orders.length,
    revenue: totalRevenue,
  };

  const filteredOrders = useMemo(() => {
    const term = orderSearch.trim().toLowerCase();
    return orders
      .filter((order) => {
        const haystack = [order.customer_name, order.phone, order.email, order.product_name, order.note]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesTerm = !term || haystack.includes(term);
        const matchesStatus = !orderStatusFilter || order.status === orderStatusFilter;
        return matchesTerm && matchesStatus;
      })
      .sort((a, b) => {
        const da = Date.parse(a.created_at || "1970-01-01");
        const db = Date.parse(b.created_at || "1970-01-01");
        return orderSort === "oldest" ? da - db : db - da;
      });
  }, [orders, orderSearch, orderStatusFilter, orderSort]);

  const revenueChart = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      return { key, label: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }), amount: 0 };
    });
    for (const order of orders) {
      const created = order.created_at?.slice(0, 10);
      const target = days.find((day) => day.key === created);
      if (target) target.amount += order.revenue_amount || revenue[orderKey(order)] || 0;
    }
    const max = Math.max(1, ...days.map((day) => day.amount));
    return days.map((day) => ({ ...day, percent: Math.max(4, Math.round((day.amount / max) * 100)) }));
  }, [orders, revenue]);

  // ---------------- login screen ----------------
  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbf7ef] px-4">
        <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#2f6b3f] text-white">
              <Boxes size={18} />
            </span>
            <div>
              <p className="text-sm font-bold leading-none text-stone-900">CMS Mây Tre Lục Bình</p>
              <p className="mt-1 text-xs text-stone-500">Quản trị sản phẩm & đơn hàng</p>
            </div>
          </div>

          <label className="mt-6 block text-sm font-semibold text-stone-700">
            Mật khẩu quản trị
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && login()}
              type="password"
              className="mt-2 h-11 w-full rounded border border-stone-300 px-3 text-sm focus:border-[#2f6b3f] focus:outline-none focus:ring-1 focus:ring-[#2f6b3f]"
            />
          </label>
          {loginError && <p className="mt-2 text-xs font-medium text-red-600">{loginError}</p>}

          <button
            onClick={login}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded bg-[#2f6b3f] text-sm font-bold text-white transition hover:bg-[#1f4b2e]"
          >
            Vào CMS
          </button>
          <p className="mt-4 text-center text-xs text-stone-400">Demo password: {demoPassword}</p>
        </div>
      </main>
    );
  }

  // ---------------- dashboard shell ----------------
  const navItems: { key: Tab; label: string; icon: typeof LayoutDashboard; enabled: boolean }[] = [
    { key: "overview", label: "Tổng quan", icon: LayoutDashboard, enabled: true },
    { key: "products", label: "Sản phẩm", icon: Package, enabled: true },
    { key: "categories", label: "Danh mục", icon: Tag, enabled: true },
    { key: "orders", label: "Đơn hàng", icon: ShoppingCart, enabled: true },
  ];
  const soonItems: { label: string; icon: typeof Tag }[] = [
    { label: "Cài đặt", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900">
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
        <div className="flex items-center gap-2 border-b border-stone-200 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#2f6b3f] text-white">
            <Boxes size={18} />
          </span>
          <div>
            <p className="text-sm font-bold leading-none">Mây Tre Lục Bình</p>
            <p className="mt-1 text-xs text-stone-500">CMS quản trị</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-semibold transition ${
                tab === key ? "bg-[#eef7ed] text-[#1f4b2e]" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Icon size={17} /> {label}
            </button>
          ))}

          <p className="px-3 pt-4 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Sắp ra mắt
          </p>
          {soonItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              disabled
              title="Tính năng đang phát triển"
              className="flex w-full cursor-not-allowed items-center gap-3 rounded px-3 py-2.5 text-sm font-semibold text-stone-300"
            >
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-stone-200 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100"
          >
            <LogOut size={17} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN ---------------- */}
      <div className="flex-1">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-stone-200 bg-white px-5 py-3">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm sản phẩm theo tên hoặc danh mục..."
              disabled={tab !== "products"}
              className="h-10 w-full rounded border border-stone-300 bg-stone-50 pl-9 pr-3 text-sm focus:border-[#2f6b3f] focus:outline-none focus:ring-1 focus:ring-[#2f6b3f] disabled:opacity-50"
            />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-stone-500 sm:block">Xin chào, Admin</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef7ed] text-sm font-bold text-[#1f4b2e]">
              A
            </span>
          </div>
        </header>

        <main className="p-5">
          {message && (
            <div className="mb-4 flex items-center justify-between rounded border border-[#2f6b3f]/30 bg-[#eef7ed] px-4 py-2.5 text-sm font-semibold text-[#1f4b2e]">
              {message}
              <button onClick={() => setMessage("")} className="text-[#1f4b2e]/60 hover:text-[#1f4b2e]">
                <X size={14} />
              </button>
            </div>
          )}

          {/* ---------------- OVERVIEW ---------------- */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard label="Tổng sản phẩm" value={stats.total} icon={Package} />
                <StatCard label="Sản phẩm nổi bật" value={stats.featured} icon={Star} />
                <StatCard label="Sản phẩm mới" value={stats.isNew} icon={Sparkles} />
                <StatCard
                  label="Đơn hàng đã ghi nhận"
                  value={ordersLoaded ? stats.orders : "—"}
                  icon={ShoppingCart}
                  onClick={() => loadOrders()}
                  hint={ordersLoaded ? undefined : "Bấm để tải"}
                />
                <StatCard
                  label="Doanh thu"
                  value={`${stats.revenue.toLocaleString("vi-VN")} đ`}
                  icon={Wallet}
                  onClick={() => setTab("orders")}
                  hint="Xem đơn hàng"
                />
              </div>

              <div className="rounded-lg border border-stone-200 bg-white">
                <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                  <div>
                    <h2 className="font-bold">Doanh thu 7 ngày</h2>
                    <p className="text-xs text-stone-500">Dựa trên doanh thu đã ghi ở đơn hàng</p>
                  </div>
                </div>
                <div className="flex h-64 items-end gap-3 px-5 py-5">
                  {revenueChart.map((day) => (
                    <div key={day.key} className="flex h-full flex-1 flex-col justify-end gap-2">
                      <div className="flex flex-1 items-end rounded bg-stone-50 px-1">
                        <div
                          className="w-full rounded-t bg-[#2f6b3f] transition-all"
                          style={{ height: `${day.percent}%` }}
                          title={`${day.amount.toLocaleString("vi-VN")} đ`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-bold text-stone-500">{day.label}</p>
                        <p className="mt-0.5 text-[10px] text-stone-400">{day.amount ? `${Math.round(day.amount / 1000).toLocaleString("vi-VN")}k` : "0"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white">
                <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                  <h2 className="font-bold">Đơn hàng gần đây</h2>
                  <button
                    onClick={() => setTab("orders")}
                    className="text-sm font-semibold text-[#2f6b3f] hover:underline"
                  >
                    Xem tất cả
                  </button>
                </div>
                <OrderRows orders={filteredOrders.slice(0, 5)} loaded={ordersLoaded} compact />
              </div>
            </div>
          )}

          {/* ---------------- PRODUCTS ---------------- */}
          {tab === "products" && (
            <div className="rounded-lg border border-stone-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
                <div>
                  <h2 className="font-bold">Sản phẩm</h2>
                  <p className="text-xs text-stone-500">{filteredProducts.length} sản phẩm</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSlugs.size > 0 && (
                    <div className="flex items-center gap-2 rounded border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm">
                      <span className="font-semibold">{selectedSlugs.size} đã chọn</span>
                      <button
                        onClick={() => deleteProducts(Array.from(selectedSlugs))}
                        className="flex items-center gap-1 rounded px-2 py-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={13} /> Xoá
                      </button>
                      <button
                        onClick={() => setSelectedSlugs(new Set())}
                        className="rounded px-2 py-1 text-stone-600 hover:bg-stone-200"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  )}
                  <button
                    onClick={openCreateProduct}
                    className="flex items-center gap-1.5 rounded bg-[#2f6b3f] px-3 py-2 text-sm font-bold text-white hover:bg-[#1f4b2e]"
                  >
                    <Plus size={15} /> Thêm sản phẩm
                  </button>
                </div>
              </div>

              <div className="grid gap-3 border-b border-stone-200 bg-stone-50 px-5 py-4 md:grid-cols-3">
                <select
                  value={productCategoryFilter}
                  onChange={(event) => {
                    setProductCategoryFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-10 rounded border border-stone-300 bg-white px-3 text-sm font-semibold"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>{category.name}</option>
                  ))}
                </select>
                <select
                  value={productFlagFilter}
                  onChange={(event) => {
                    setProductFlagFilter(event.target.value);
                    setPage(1);
                  }}
                  className="h-10 rounded border border-stone-300 bg-white px-3 text-sm font-semibold"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="featured">Nổi bật</option>
                  <option value="new">Sản phẩm mới</option>
                  <option value="normal">Bình thường</option>
                </select>
                <select
                  value={productSort}
                  onChange={(event) => {
                    setProductSort(event.target.value as ProductSortMode);
                    setPage(1);
                  }}
                  className="h-10 rounded border border-stone-300 bg-white px-3 text-sm font-semibold"
                >
                  <option value="newest">Đăng mới nhất</option>
                  <option value="oldest">Đăng lâu nhất</option>
                  <option value="name_asc">Tên A-Z</option>
                  <option value="name_desc">Tên Z-A</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
                      <th className="w-10 px-5 py-3">
                        <input
                          type="checkbox"
                          checked={pagedProducts.length > 0 && selectedSlugs.size === pagedProducts.length}
                          onChange={toggleAllRows}
                          className="h-4 w-4 accent-[#2f6b3f]"
                        />
                      </th>
                      <th className="px-3 py-3">Sản phẩm</th>
                      <th className="px-3 py-3">
                        <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-stone-800">
                          Tên <ArrowUpDown size={12} className={sortKey === "name" ? "text-[#2f6b3f]" : ""} />
                        </button>
                      </th>
                      <th className="px-3 py-3">Danh mục</th>
                      <th className="px-3 py-3">
                        <button onClick={() => toggleSort("price")} className="flex items-center gap-1 hover:text-stone-800">
                          Giá <ArrowUpDown size={12} className={sortKey === "price" ? "text-[#2f6b3f]" : ""} />
                        </button>
                      </th>
                      <th className="px-3 py-3">Trạng thái</th>
                      <th className="px-5 py-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedProducts.map((product) => (
                      <tr key={product.slug} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                        <td className="px-5 py-3">
                          <input
                            type="checkbox"
                            checked={selectedSlugs.has(product.slug)}
                            onChange={() => toggleRow(product.slug)}
                            className="h-4 w-4 accent-[#2f6b3f]"
                          />
                        </td>
                        <td className="px-3 py-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-16 w-16 rounded bg-white object-contain p-1 ring-1 ring-stone-200"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-semibold text-stone-800">{product.name}</p>
                          <p className="text-xs text-stone-400">{product.slug}</p>
                        </td>
                        <td className="px-3 py-3 text-stone-600">{categoryLabel(categories, product.category)}</td>
                        <td className="px-3 py-3 font-semibold text-stone-800">{product.price}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {product.featured && <Badge tone="green">Nổi bật</Badge>}
                            {product.isNew && <Badge tone="amber">Mới</Badge>}
                            {product.status === "inactive" && <Badge tone="stone">Đang ẩn</Badge>}
                            {!product.featured && !product.isNew && product.status !== "inactive" && <Badge tone="stone">Bình thường</Badge>}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openEditProduct(product)}
                              className="rounded border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-700 hover:border-[#2f6b3f] hover:text-[#1f4b2e]"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => deleteProducts([product.slug])}
                              className="flex items-center gap-1 rounded border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:border-red-400 hover:bg-red-50"
                            >
                              <Trash2 size={12} /> Xoá
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pagedProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-sm text-stone-500">
                          Không tìm thấy sản phẩm phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <AdminPagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          )}

          {/* ---------------- CATEGORIES ---------------- */}
          {tab === "categories" && (
            <div className="rounded-lg border border-stone-200 bg-white">
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <div>
                  <h2 className="font-bold">Danh mục sản phẩm</h2>
                  <p className="text-xs text-stone-500">{categories.length} danh mục</p>
                </div>
                <button
                  onClick={() => setEditingCategory(blankCategory())}
                  className="flex items-center gap-1.5 rounded bg-[#2f6b3f] px-3 py-2 text-sm font-bold text-white"
                >
                  <Plus size={15} /> Thêm danh mục
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
                      <th className="px-5 py-3">Tên</th>
                      <th className="px-3 py-3">Slug</th>
                      <th className="px-3 py-3">Thứ tự</th>
                      <th className="px-3 py-3">Trạng thái</th>
                      <th className="px-5 py-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.slug} className="border-b border-stone-100 last:border-0">
                        <td className="px-5 py-3">
                          <p className="font-bold">{category.name}</p>
                          <p className="text-xs text-stone-500">{category.description}</p>
                        </td>
                        <td className="px-3 py-3 text-stone-600">{category.slug}</td>
                        <td className="px-3 py-3 text-stone-600">{category.sortOrder || 100}</td>
                        <td className="px-3 py-3">
                          <Badge tone={category.status === "draft" ? "stone" : "green"}>
                            {category.status === "draft" ? "Nháp" : "Hoạt động"}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => setEditingCategory(category)} className="mr-2 rounded border border-stone-300 px-3 py-1.5 text-xs font-bold">
                            Sửa
                          </button>
                          <button onClick={() => deleteCategory(category.slug)} className="rounded border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600">
                            Xoá
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- ORDERS ---------------- */}
          {tab === "orders" && (
            <div className="rounded-lg border border-stone-200 bg-white">
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <div>
                  <h2 className="font-bold">Đơn hàng</h2>
                  <p className="text-xs text-stone-500">
                    {filteredOrders.length} / {orders.length} đơn · Doanh thu {stats.revenue.toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <button
                  onClick={() => loadOrders()}
                  className="rounded border border-stone-300 px-3 py-1.5 text-sm font-bold text-stone-700 hover:border-[#2f6b3f]"
                >
                  Tải lại
                </button>
                <button
                  onClick={() => setCreateOrderOpen(true)}
                  className="ml-2 rounded bg-[#2f6b3f] px-3 py-1.5 text-sm font-bold text-white"
                >
                  Tạo đơn tại chỗ
                </button>
              </div>
              <div className="grid gap-3 border-b border-stone-200 bg-stone-50 px-5 py-4 md:grid-cols-3">
                <input
                  value={orderSearch}
                  onChange={(event) => setOrderSearch(event.target.value)}
                  placeholder="Tìm khách, SĐT, email, sản phẩm..."
                  className="h-10 rounded border border-stone-300 bg-white px-3 text-sm font-semibold"
                />
                <select
                  value={orderStatusFilter}
                  onChange={(event) => setOrderStatusFilter(event.target.value)}
                  className="h-10 rounded border border-stone-300 bg-white px-3 text-sm font-semibold"
                >
                  <option value="">Tất cả trạng thái</option>
                  {orderStatuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <select
                  value={orderSort}
                  onChange={(event) => setOrderSort(event.target.value as OrderSortMode)}
                  className="h-10 rounded border border-stone-300 bg-white px-3 text-sm font-semibold"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Lâu nhất</option>
                </select>
              </div>
              <OrderRows
                orders={filteredOrders}
                loaded={ordersLoaded}
                revenue={revenue}
                onAddRevenue={(order) => setRevenueOrder(order)}
                onStatusChange={updateOrderStatus}
                onView={(order) => setDetailOrder(order)}
                onDelete={deleteOrder}
              />
            </div>
          )}
        </main>
      </div>

      {/* ---------------- EDIT DRAWER ---------------- */}
      {editing && (
        <EditDrawer
          key={editorMode === "create" ? "new" : editing.slug}
          mode={editorMode}
          product={editing}
          categories={categories}
          adminKey={password}
          onClose={() => setEditing(null)}
          onSave={saveProduct}
        />
      )}

      {/* ---------------- REVENUE DRAWER ---------------- */}
      {revenueOrder && (
        <RevenueDrawer
          order={revenueOrder}
          initialAmount={revenue[orderKey(revenueOrder)]}
          onClose={() => setRevenueOrder(null)}
          onSave={(amount) => saveRevenue(revenueOrder, amount)}
        />
      )}

      {detailOrder && (
        <OrderDetailDrawer
          order={detailOrder}
          revenue={revenue[orderKey(detailOrder)] || detailOrder.revenue_amount || 0}
          onClose={() => setDetailOrder(null)}
          onAddRevenue={(order) => setRevenueOrder(order)}
          onStatusChange={updateOrderStatus}
          onDelete={deleteOrder}
        />
      )}

      {editingCategory && (
        <CategoryDrawer
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={saveCategory}
        />
      )}

      {createOrderOpen && (
        <CreateOrderDrawer
          products={products}
          onClose={() => setCreateOrderOpen(false)}
          onSave={createAdminOrder}
        />
      )}

      <style jsx global>{`
        .admin-input {
          height: 2.5rem;
          width: 100%;
          border-radius: 0.25rem;
          border: 1px solid #d6d3d1;
          padding: 0 0.75rem;
          font-size: 0.875rem;
        }
        textarea.admin-input {
          height: auto;
          padding-top: 0.5rem;
        }
        .admin-input:focus {
          outline: none;
          border-color: #2f6b3f;
          box-shadow: 0 0 0 1px #2f6b3f;
        }
      `}</style>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  onClick,
  hint,
}: {
  label: string;
  value: number | string;
  icon: typeof Package;
  onClick?: () => void;
  hint?: string;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`rounded-lg border border-stone-200 bg-white p-5 text-left ${onClick ? "transition hover:border-[#2f6b3f]" : ""}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-stone-500">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef7ed] text-[#2f6b3f]">
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-black text-stone-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </Wrapper>
  );
}

function Badge({ tone, children }: { tone: "green" | "amber" | "stone"; children: React.ReactNode }) {
  const tones = {
    green: "bg-[#eef7ed] text-[#1f4b2e]",
    amber: "bg-amber-50 text-amber-700",
    stone: "bg-stone-100 text-stone-500",
  } as const;
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

function paginationPages(page: number, pageCount: number) {
  const pages = new Set([1, pageCount, page - 1, page, page + 1, 2, 3]);
  return Array.from(pages)
    .filter((item) => item >= 1 && item <= pageCount)
    .sort((a, b) => a - b);
}

function AdminPagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  const pages = paginationPages(page, pageCount);
  const go = (next: number) => onPageChange(Math.min(pageCount, Math.max(1, next)));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 px-5 py-3 text-sm">
      <p className="font-semibold text-stone-500">Trang {page} / {pageCount}</p>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="h-9 rounded border border-stone-300 px-3 font-bold text-stone-700 disabled:opacity-40"
        >
          Trước
        </button>
        {pages.map((item, index) => {
          const previous = pages[index - 1];
          return (
            <span key={item} className="contents">
              {previous && item - previous > 1 ? <span className="px-1 font-bold text-stone-400">...</span> : null}
              <button
                onClick={() => go(item)}
                className={`grid h-9 w-9 place-items-center rounded border text-sm font-black ${
                  item === page ? "border-[#2f6b3f] bg-[#2f6b3f] text-white" : "border-stone-300 bg-white text-stone-800"
                }`}
              >
                {item}
              </button>
            </span>
          );
        })}
        <button
          onClick={() => go(page + 1)}
          disabled={page >= pageCount}
          className="h-9 rounded border border-stone-300 px-3 font-bold text-stone-700 disabled:opacity-40"
        >
          Sau
        </button>
        <label className="ml-2 flex items-center gap-2 text-sm font-semibold text-stone-600">
          Tới trang
          <input
            type="number"
            min={1}
            max={pageCount}
            defaultValue={page}
            onKeyDown={(event) => {
              if (event.key === "Enter") go(Number(event.currentTarget.value));
            }}
            className="h-9 w-20 rounded border border-stone-300 bg-white px-2 text-center font-black"
          />
        </label>
      </div>
    </div>
  );
}

function paymentLabel(method?: PaymentMethod) {
  return method === "store" ? "Thanh toán tại cửa hàng" : "Thanh toán khi nhận hàng";
}

function OrderRows({
  orders,
  loaded,
  compact = false,
  revenue = {},
  onAddRevenue,
  onStatusChange,
  onView,
  onDelete,
}: {
  orders: Order[];
  loaded: boolean;
  compact?: boolean;
  revenue?: Record<string, number>;
  onAddRevenue?: (order: Order) => void;
  onStatusChange?: (order: Order, status: OrderStatus) => void;
  onView?: (order: Order) => void;
  onDelete?: (order: Order) => void;
}) {
  if (!loaded) {
    return <p className="px-5 py-10 text-center text-sm text-stone-500">Chưa tải đơn hàng.</p>;
  }
  if (orders.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-stone-500">
        Chưa có đơn hàng nào hoặc chưa kết nối Supabase.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
            <th className="px-5 py-3">Khách hàng</th>
            <th className="px-3 py-3">Điện thoại</th>
            <th className="px-3 py-3">Sản phẩm</th>
            <th className="px-3 py-3">SL</th>
            {!compact && <th className="px-3 py-3">Trạng thái</th>}
            {!compact && <th className="px-3 py-3">Ghi chú</th>}
            {!compact && <th className="px-3 py-3">Doanh thu</th>}
            {!compact && <th className="px-3 py-3">Thao tác</th>}
            <th className="px-5 py-3 text-right">Thời gian</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const key = orderKey(order);
            const amount = revenue[key];
            return (
              <tr key={key} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                <td className="px-5 py-3 font-semibold text-stone-800">{order.customer_name}</td>
                <td className="px-3 py-3 text-stone-600">{order.phone}</td>
                <td className="px-3 py-3 text-stone-600">{order.product_name || "Liên hệ chung"}</td>
                <td className="px-3 py-3 text-stone-600">{order.quantity}</td>
                {!compact && (
                  <td className="px-3 py-3">
                    <select
                      value={order.status || "pending"}
                      onChange={(event) => onStatusChange?.(order, event.target.value as OrderStatus)}
                      className="h-9 rounded border border-stone-300 bg-white px-2 text-xs font-bold"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
                {!compact && <td className="max-w-[220px] truncate px-3 py-3 text-stone-500">{order.note}</td>}
                {!compact && (
                  <td className="px-3 py-3">
                    {amount !== undefined ? (
                      <button
                        onClick={() => onAddRevenue?.(order)}
                        className="font-semibold text-[#1f4b2e] hover:underline"
                        title="Sửa doanh thu"
                      >
                        {amount.toLocaleString("vi-VN")} đ
                      </button>
                    ) : (
                      <button
                        onClick={() => onAddRevenue?.(order)}
                        className="flex items-center gap-1 rounded border border-stone-300 px-2.5 py-1 text-xs font-bold text-stone-700 hover:border-[#2f6b3f] hover:text-[#1f4b2e]"
                      >
                        <Wallet size={12} /> Nhập doanh thu
                      </button>
                    )}
                  </td>
                )}
                {!compact && (
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onView?.(order)}
                        className="grid h-8 w-8 place-items-center rounded border border-stone-300 text-stone-700 hover:border-[#2f6b3f] hover:text-[#1f4b2e]"
                        title="Xem chi tiết"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => onDelete?.(order)}
                        className="grid h-8 w-8 place-items-center rounded border border-red-200 text-red-600 hover:bg-red-50"
                        title="Xoá đơn"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
                <td className="px-5 py-3 text-right text-xs text-stone-400">
                  {order.created_at ? new Date(order.created_at).toLocaleString("vi-VN") : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OrderDetailDrawer({
  order,
  revenue,
  onClose,
  onAddRevenue,
  onStatusChange,
  onDelete,
}: {
  order: Order;
  revenue: number;
  onClose: () => void;
  onAddRevenue: (order: Order) => void;
  onStatusChange: (order: Order, status: OrderStatus) => void;
  onDelete: (order: Order) => void;
}) {
  const items = order.items?.length
    ? order.items
    : [{ product_name: order.product_name || "Liên hệ chung", quantity: order.quantity || 1 }];
  const [localStatus, setLocalStatus] = useState<OrderStatus>(order.status || "pending");
  const status = orderStatuses.find((item) => item.value === localStatus);

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-stone-900/30">
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <h2 className="font-bold">Chi tiết đơn hàng</h2>
            <p className="mt-1 text-xs text-stone-500">{order.id}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid gap-3 rounded border border-stone-200 bg-stone-50 p-4 text-sm">
            <InfoRow label="Khách hàng" value={order.customer_name} />
            <InfoRow label="Số điện thoại" value={order.phone} />
            <InfoRow label="Email" value={order.email || "-"} />
            <InfoRow label="Địa chỉ" value={order.address || "-"} />
            <InfoRow label="Thanh toán" value={paymentLabel(order.payment_method)} />
            <InfoRow label="Trạng thái" value={status?.label || "Chờ"} />
            <InfoRow label="Thời gian" value={order.created_at ? new Date(order.created_at).toLocaleString("vi-VN") : "-"} />
          </div>

          <section>
            <h3 className="text-sm font-black uppercase tracking-wide text-stone-900">Sản phẩm</h3>
            <div className="mt-3 overflow-hidden rounded border border-stone-200">
              {items.map((item, index) => (
                <div key={`${item.product_name}-${index}`} className="flex items-center justify-between gap-3 border-b border-stone-100 p-3 last:border-0">
                  <div>
                    <p className="font-semibold text-stone-900">{item.product_name}</p>
                    {item.price ? <p className="mt-1 text-xs font-bold text-red-600">{item.price}</p> : null}
                  </div>
                  <span className="rounded bg-stone-100 px-2.5 py-1 text-xs font-black">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-3 rounded border border-green-100 bg-green-50 p-4 text-sm">
            <InfoRow label="Doanh thu" value={`${revenue.toLocaleString("vi-VN")} đ`} />
            <button
              onClick={() => onAddRevenue(order)}
              className="h-10 rounded bg-[#2f6b3f] text-sm font-black text-white"
            >
              {revenue > 0 ? "Sửa doanh thu" : "Ghi doanh thu"}
            </button>
          </section>

          <section className="grid gap-3 rounded border border-stone-200 bg-white p-4 text-sm">
            <label className="block font-bold text-stone-700">
              Cập nhật trạng thái
              <select
                value={localStatus}
                onChange={(event) => {
                  const next = event.target.value as OrderStatus;
                  setLocalStatus(next);
                  onStatusChange(order, next);
                }}
                className="mt-2 h-10 w-full rounded border border-stone-300 bg-white px-3 text-sm font-bold"
              >
                {orderStatuses.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase tracking-wide text-stone-900">Ghi chú</h3>
            <p className="mt-2 min-h-20 rounded border border-stone-200 bg-white p-3 text-sm text-stone-600">
              {order.note || "Không có ghi chú."}
            </p>
          </section>
        </div>

        <div className="flex gap-3 border-t border-stone-200 p-5">
          <button onClick={onClose} className="h-11 flex-1 rounded border border-stone-300 text-sm font-bold text-stone-700">
            Đóng
          </button>
          <button onClick={() => onDelete(order)} className="h-11 flex-1 rounded bg-red-600 text-sm font-bold text-white">
            Xoá đơn
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3">
      <span className="text-stone-500">{label}</span>
      <span className="font-semibold text-stone-900">{value}</span>
    </div>
  );
}

function EditDrawer({
  mode,
  product,
  categories,
  adminKey,
  onClose,
  onSave,
}: {
  mode: EditorMode;
  product: Product;
  categories: Category[];
  adminKey: string;
  onClose: () => void;
  onSave: (payload: Product) => void;
}) {
  const [slug, setSlug] = useState(product.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [category, setCategory] = useState(product.category || categories[0]?.slug || "");
  const [image, setImage] = useState(product.image);
  const [images, setImages] = useState<string[]>(product.images || []);
  const [description, setDescription] = useState(product.description);
  const [featured, setFeatured] = useState(product.featured);
  const [isNew, setIsNew] = useState(product.isNew);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function handleNameChange(value: string) {
    setName(value);
    if (mode === "create" && !slugTouched) setSlug(slugify(value));
  }

  async function uploadImage(file: File | undefined, mode: "primary" | "gallery" = "primary") {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "products");
    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      headers: { "x-admin-key": adminKey },
      body: formData,
    });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    setUploading(false);
    if (!response.ok || !payload.url) {
      setUploadError(payload.error || "Upload ảnh chưa thành công.");
      return;
    }
    if (mode === "primary") {
      setImage(payload.url);
      setImages((items) => [...new Set([payload.url!, ...items])]);
    } else {
      setImages((items) => [...new Set([...items, payload.url!])]);
      if (!image) setImage(payload.url);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-stone-900/30">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-bold">{mode === "create" ? "Thêm sản phẩm" : "Sửa sản phẩm"}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={image}
              alt={name}
              className="h-40 w-full rounded-md border border-stone-200 object-cover"
            />
          )}

          <Field label="Tên sản phẩm">
            <input value={name} onChange={(e) => handleNameChange(e.target.value)} className="admin-input" />
          </Field>

          {mode === "create" && (
            <Field label="Slug (đường dẫn)">
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="tu-lac-binh-hinh-oval"
                className="admin-input"
              />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Giá">
              <input value={price} onChange={(e) => setPrice(e.target.value)} className="admin-input" />
            </Field>
            <Field label="Danh mục">
              {categories.length ? (
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input">
                  {categories.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="rounded bg-amber-50 p-3 text-xs font-bold text-amber-700">Cần tạo danh mục trước.</p>
              )}
            </Field>
          </div>
          <Field label="Ảnh chính">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[#2f6b3f]/40 bg-green-50 px-4 py-3 text-sm font-bold text-[#1f4b2e] hover:bg-green-100">
              <ImagePlus size={18} />
              {uploading ? "Đang upload..." : "Chọn ảnh chính"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={uploading}
                onChange={(event) => uploadImage(event.target.files?.[0], "primary")}
                className="hidden"
              />
            </label>
            {image ? <p className="mt-2 break-all text-xs text-stone-500">{image}</p> : null}
            {uploadError ? <p className="mt-2 rounded bg-red-50 p-2 text-xs font-bold text-red-700">{uploadError}</p> : null}
          </Field>

          <Field label="Gallery nhiều ảnh">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-100">
              <ImagePlus size={18} />
              {uploading ? "Đang upload..." : "Thêm ảnh phụ"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={uploading}
                multiple
                onChange={async (event) => {
                  for (const file of Array.from(event.target.files || [])) {
                    await uploadImage(file, "gallery");
                  }
                  event.currentTarget.value = "";
                }}
                className="hidden"
              />
            </label>
            {images.length ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {images.map((url) => (
                  <div key={url} className="group relative aspect-square overflow-hidden rounded border border-stone-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={name} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-1 bottom-1 hidden gap-1 group-hover:flex">
                      <button
                        type="button"
                        onClick={() => setImage(url)}
                        className="flex-1 rounded bg-white/90 px-1 py-1 text-[10px] font-bold text-[#1f4b2e]"
                      >
                        Chính
                      </button>
                      <button
                        type="button"
                        onClick={() => setImages((items) => items.filter((item) => item !== url))}
                        className="rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white"
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-stone-500">Có thể thêm nhiều ảnh cho trang chi tiết sản phẩm.</p>
            )}
          </Field>
          <Field label="Mô tả">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="admin-input resize-none"
            />
          </Field>

          <div className="flex gap-6 pt-1">
            <Toggle label="Nổi bật" checked={featured} onChange={setFeatured} />
            <Toggle label="Sản phẩm mới" checked={isNew} onChange={setIsNew} />
          </div>
        </div>

        <div className="flex gap-3 border-t border-stone-200 p-5">
          <button
            onClick={onClose}
            className="h-11 flex-1 rounded border border-stone-300 text-sm font-bold text-stone-700 hover:bg-stone-50"
          >
            Huỷ
          </button>
          <button
            onClick={() =>
              onSave({ ...product, slug, name, price, category, image, images: [...new Set([image, ...images].filter(Boolean))], description, featured, isNew })
            }
            disabled={!name.trim() || !image.trim() || !category || uploading}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded bg-[#2f6b3f] text-sm font-bold text-white hover:bg-[#1f4b2e] disabled:opacity-50"
          >
            <Save size={16} /> {mode === "create" ? "Thêm sản phẩm" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RevenueDrawer({
  order,
  initialAmount,
  onClose,
  onSave,
}: {
  order: Order;
  initialAmount?: number;
  onClose: () => void;
  onSave: (amount: number) => void;
}) {
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : "");

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-stone-900/30">
      <div className="flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-bold">Nhập doanh thu</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 p-5">
          <div className="rounded border border-stone-200 bg-stone-50 p-3 text-sm">
            <p className="font-semibold text-stone-800">{order.customer_name}</p>
            <p className="text-stone-500">
              {order.product_name || "Liên hệ chung"} · SL {order.quantity}
            </p>
          </div>

          <Field label="Số tiền (đ)">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              placeholder="VD: 350000"
              className="admin-input"
              autoFocus
            />
          </Field>
          {amount && (
            <p className="text-xs text-stone-400">
              = {parseInt(amount || "0", 10).toLocaleString("vi-VN")} đ
            </p>
          )}
        </div>

        <div className="flex gap-3 border-t border-stone-200 p-5">
          <button
            onClick={onClose}
            className="h-11 flex-1 rounded border border-stone-300 text-sm font-bold text-stone-700 hover:bg-stone-50"
          >
            Huỷ
          </button>
          <button
            onClick={() => amount && onSave(parseInt(amount, 10))}
            disabled={!amount}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded bg-[#2f6b3f] text-sm font-bold text-white hover:bg-[#1f4b2e] disabled:opacity-50"
          >
            <Save size={16} /> Ghi nhận
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryDrawer({
  category,
  onClose,
  onSave,
}: {
  category: Category;
  onClose: () => void;
  onSave: (category: Category) => void;
}) {
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [nameEn, setNameEn] = useState(category.nameEn);
  const [description, setDescription] = useState(category.description);
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder || 100));
  const [status, setStatus] = useState(category.status || "active");

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-stone-900/30">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-bold">Danh mục sản phẩm</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700"><X size={18} /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <Field label="Tên danh mục">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!category.slug) setSlug(slugify(e.target.value));
              }}
              className="admin-input"
            />
          </Field>
          <Field label="Slug">
            <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className="admin-input" />
          </Field>
          <Field label="Tên tiếng Anh">
            <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="admin-input" />
          </Field>
          <Field label="Mô tả">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="admin-input resize-none" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Thứ tự">
              <input value={sortOrder} onChange={(e) => setSortOrder(e.target.value.replace(/[^\d]/g, ""))} className="admin-input" />
            </Field>
            <Field label="Trạng thái">
              <select value={status} onChange={(e) => setStatus(e.target.value as "active" | "draft")} className="admin-input">
                <option value="active">Hoạt động</option>
                <option value="draft">Nháp</option>
              </select>
            </Field>
          </div>
        </div>
        <div className="flex gap-3 border-t border-stone-200 p-5">
          <button onClick={onClose} className="h-11 flex-1 rounded border border-stone-300 text-sm font-bold">Huỷ</button>
          <button
            onClick={() => onSave({ ...category, name, slug, nameEn, description, sortOrder: Number(sortOrder) || 100, status })}
            className="h-11 flex-1 rounded bg-[#2f6b3f] text-sm font-bold text-white"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateOrderDrawer({
  products,
  onClose,
  onSave,
}: {
  products: Product[];
  onClose: () => void;
  onSave: (order: Order) => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("store");
  const [productSlug, setProductSlug] = useState(products[0]?.slug || "");
  const [manualName, setManualName] = useState("");
  const [quantity, setQuantity] = useState("1");

  const selectedProduct = products.find((product) => product.slug === productSlug);
  const productName = manualName.trim() || selectedProduct?.name || "Sản phẩm tại cửa hàng";

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-stone-900/30">
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-bold">Tạo đơn tại chỗ</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700"><X size={18} /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tên khách">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="admin-input" />
            </Field>
            <Field label="Số điện thoại">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="admin-input" />
            </Field>
          </div>
          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="admin-input" />
          </Field>
          <Field label="Địa chỉ">
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="admin-input" />
          </Field>
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <Field label="Chọn sản phẩm">
              <select value={productSlug} onChange={(e) => setProductSlug(e.target.value)} className="admin-input">
                {products.map((product) => (
                  <option key={product.slug} value={product.slug}>{product.name}</option>
                ))}
              </select>
            </Field>
            <Field label="SL">
              <input value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/[^\d]/g, ""))} className="admin-input" />
            </Field>
          </div>
          <Field label="Hoặc nhập sản phẩm thủ công">
            <input value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="VD: Ghế mây đặt riêng" className="admin-input" />
          </Field>
          <Field label="Hình thức thanh toán">
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="admin-input">
              <option value="store">Thanh toán tại cửa hàng</option>
              <option value="cod">Thanh toán khi nhận hàng</option>
            </select>
          </Field>
          <Field label="Ghi chú">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="admin-input resize-none" />
          </Field>
        </div>
        <div className="flex gap-3 border-t border-stone-200 p-5">
          <button onClick={onClose} className="h-11 flex-1 rounded border border-stone-300 text-sm font-bold">Huỷ</button>
          <button
            onClick={() =>
              onSave({
                customer_name: customerName,
                phone,
                email,
                address,
                note,
                payment_method: paymentMethod,
                quantity: Number(quantity) || 1,
                product_slug: selectedProduct?.slug,
                product_name: productName,
                items: [
                  {
                    product_slug: selectedProduct?.slug,
                    product_name: productName,
                    image: selectedProduct?.image,
                    price: selectedProduct?.price,
                    quantity: Number(quantity) || 1,
                  },
                ],
              })
            }
            disabled={!customerName.trim() || !phone.trim()}
            className="h-11 flex-1 rounded bg-[#2f6b3f] text-sm font-bold text-white disabled:opacity-50"
          >
            Tạo đơn
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-stone-700">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[#2f6b3f]" : "bg-stone-300"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
      {label}
    </label>
  );
}
