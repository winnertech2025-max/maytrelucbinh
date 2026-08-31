import { AdminDashboard } from "@/components/admin-dashboard";
import { getAdminProducts, getCategories } from "@/lib/data";

export default async function AdminPage() {
  const [products, categories] = await Promise.all([getAdminProducts(), getCategories()]);
  return <AdminDashboard initialProducts={products} initialCategories={categories} />;
}
