"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/admin/(panel)/actions";
import ConfirmDialog from "@/components/admin/confirm-dialog";

export default function DeleteProductButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(true)}
        className="mac-btn"
        data-variant="danger"
      >
        Delete
      </button>
      <ConfirmDialog
        open={confirming}
        pending={pending}
        title="Delete this product?"
        message="It's removed from the store along with its sizes. This can't be undone."
        confirmLabel="Delete"
        onConfirm={() =>
          startTransition(async () => {
            await deleteProduct(id);
            router.push("/admin");
          })
        }
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
