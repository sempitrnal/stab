"use client";

import { useOptimistic, useTransition } from "react";
import { setProductActive } from "@/app/admin/(panel)/actions";
import MacSwitch from "@/components/admin/mac-switch";

// Store visibility switch. Flips instantly, saves in the background.
export default function ActiveToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(active);

  return (
    <MacSwitch
      checked={shown}
      disabled={pending}
      label={shown ? "Visible in store" : "Hidden from store"}
      onChange={(next) =>
        startTransition(async () => {
          setShown(next);
          await setProductActive(id, next);
        })
      }
    />
  );
}
