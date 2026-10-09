import { notFound } from "next/navigation";
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
    <div className="px-4 py-6 max-w-2xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-black uppercase tracking-tight text-2xl min-w-0 truncate">
          Edit · {product.title}
        </h1>
        <DeleteProductButton id={product.id} />
      </div>
      <ProductForm product={product} />
    </div>
  );
}
