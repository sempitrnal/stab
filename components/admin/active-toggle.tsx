"use client";

import { useTransition } from "react";
import { setProductActive } from "@/app/admin/(panel)/actions";

export default function ActiveToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => setProductActive(id, !active))}
      className="font-mono text-[10px] uppercase tracking-widest text-faded hover:text-accent transition-colors w-14 text-right"
    >
      {active ? "Hide" : "Show"}
    </button>
  );
}
