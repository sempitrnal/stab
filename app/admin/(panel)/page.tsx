import { getAllProducts } from "@/lib/admin-data";
import AdminWindow, { NewProductButton } from "@/components/admin/admin-window";
import ProductTable from "@/components/admin/product-table";

export const metadata = { title: "STAB · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const products = await getAllProducts();

  return (
    <AdminWindow title="Products" section="products" actions={<NewProductButton />}>
      <ProductTable products={products} />
    </AdminWindow>
  );
}
