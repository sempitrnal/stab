"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/admin/(panel)/actions";

export default function DeleteProductButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this product? This cannot be undone.")) {
          startTransition(async () => {
            await deleteProduct(id);
            router.push("/admin");
          });
        }
      }}
      className="font-mono text-[11px] uppercase tracking-widest text-accent hover:underline"
    >
      Delete
    </button>
  );
}
