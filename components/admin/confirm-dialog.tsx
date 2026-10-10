"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

// macOS-style alert. Used instead of window.confirm(), which some browsers
// and embedded webviews block (it then silently returns false).
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  // Portals need document; only render after hydration.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onCancel]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="mac fixed inset-0 z-[100] flex items-center justify-center bg-black/25 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => !pending && onCancel()}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby={message ? "confirm-message" : undefined}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[280px] rounded-[14px] bg-[rgb(246_246_248/0.92)] p-4 text-center shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_20px_50px_rgb(0_0_0/0.25)] backdrop-blur-2xl backdrop-saturate-150"
          >
            <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-[11px] bg-[#ff3b30] text-[22px] font-bold leading-none text-white shadow-[inset_0_0.5px_0_rgb(255_255_255/0.3)]">
              !
            </div>
            <h2 id="confirm-title" className="text-[13px] font-semibold">
              {title}
            </h2>
            {message && (
              <p id="confirm-message" className="mt-1 text-[11px] leading-snug text-[var(--mac-secondary)]">
                {message}
              </p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                ref={cancelRef}
                type="button"
                disabled={pending}
                onClick={onCancel}
                className="mac-btn w-full"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={onConfirm}
                className="mac-btn w-full bg-[#ff3b30]! text-white! hover:brightness-110"
              >
                {pending ? "Deleting…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
