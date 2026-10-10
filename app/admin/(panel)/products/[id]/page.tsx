import { notFound } from "next/navigation";
import AdminWindow from "@/components/admin/admin-window";
import ProductForm from "@/components/admin/product-form";
import DeleteProductButton from "@/components/admin/delete-product-button";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Product } from "@/lib/types";

export const metadata = { title: "STAB · Edit product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage(
  props: PageProps<"/admin/products/[id]">,
) {
  const { id } = await props.params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*, variants(*)")
    .eq("id", id)
    .order("sort_order", { referencedTable: "variants", ascending: true })
    .single();

  if (!data) notFound();
  const product = data as Product;

  return (
    <AdminWindow title={product.title} section="products">
      <ProductForm
        product={product}
        actions={<DeleteProductButton id={product.id} />}
      />
    </AdminWindow>
  );
}
