import AdminWindow from "@/components/admin/admin-window";
import ProductForm from "@/components/admin/product-form";

export const metadata = { title: "STAB · New product" };

export default function NewProductPage() {
  return (
    <AdminWindow title="New product" section="products">
      <ProductForm />
    </AdminWindow>
  );
}
