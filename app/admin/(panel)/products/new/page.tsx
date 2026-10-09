import ProductForm from "@/components/admin/product-form";

export const metadata = { title: "STAB · New product" };

export default function NewProductPage() {
  return (
    <div className="px-4 py-6 max-w-2xl">
      <h1 className="font-black uppercase tracking-tight text-2xl mb-6">
        New product
      </h1>
      <ProductForm />
    </div>
  );
}
