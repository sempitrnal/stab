"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { deleteOrders } from "@/app/admin/(panel)/actions";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import MacCheckbox from "@/components/admin/mac-checkbox";
import Segmented from "@/components/admin/segmented";
import { PAYMENT, Pill, SHIPPING, StatusPill } from "@/components/admin/order-badges";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";

type Filter = "all" | "to_pay" | "paid" | "fulfilled" | "closed";

const MATCH: Record<Filter, (o: Order) => boolean> = {
  all: () => true,
  to_pay: (o) => o.status === "pending" || o.status === "half_paid",
  paid: (o) => o.status === "paid",
  fulfilled: (o) => o.status === "fulfilled",
  closed: (o) => o.status === "cancelled" || o.status === "refunded",
};

const COLS = "md:grid-cols-[1rem_minmax(0,1.4fr)_minmax(0,1fr)_6rem_7.5rem_6rem]";

// Mail-style order list: search, status filter, click a row to open, tick
// rows (shift-click for a range) to bulk delete.
export default function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        MATCH[filter](o) &&
        (!q ||
          o.ref.toLowerCase().includes(q) ||
          o.name.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))),
    );
  }, [orders, query, filter]);

  const toPay = orders.filter(MATCH.to_pay).length;

  const [picked, setPicked] = useState<Set<string>>(new Set());
  const anchor = useRef<number | null>(null);
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Only count ids that still exist (e.g. after a delete or refresh).
  const selected = useMemo(
    () => new Set(orders.filter((o) => picked.has(o.id)).map((o) => o.id)),
    [orders, picked],
  );
  const visibleSelected = rows.filter((o) => selected.has(o.id)).length;
  const allVisible = rows.length > 0 && visibleSelected === rows.length;

  function toggle(index: number, shiftKey: boolean) {
    const id = rows[index].id;
    const next = new Set(selected);
    if (shiftKey && anchor.current != null) {
      // Range select: everything between the anchor and here takes the
      // anchor row's new state.
      const on = !selected.has(id);
      const [a, b] = [anchor.current, index].sort((x, y) => x - y);
      rows.slice(a, b + 1).forEach((o) => (on ? next.add(o.id) : next.delete(o.id)));
    } else {
      if (next.has(id)) next.delete(id);
      else next.add(id);
      anchor.current = index;
    }
    setPicked(next);
  }

  function toggleAll() {
    const next = new Set(selected);
    rows.forEach((o) => (allVisible ? next.delete(o.id) : next.add(o.id)));
    setPicked(next);
  }

  function removeSelected() {
    const ids = [...selected];
    setDeleteError(null);
    startDelete(async () => {
      try {
        await deleteOrders(ids);
        setPicked(new Set());
        anchor.current = null;
        setConfirming(false);
        router.refresh();
      } catch {
        setConfirming(false);
        setDeleteError("Couldn't delete. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative w-full md:w-64">
          <span className="sr-only">Search orders</span>
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--mac-secondary)]"
          >
            <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ref, name, email, phone"
            className="mac-input pl-8! rounded-full! bg-[var(--mac-fill)]! border-transparent! focus:bg-white!"
          />
        </label>
        <div className="max-w-full overflow-x-auto">
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: `All ${orders.length}` },
              { value: "to_pay", label: `To pay ${toPay}` },
              { value: "paid", label: "Paid" },
              { value: "fulfilled", label: "Fulfilled" },
              { value: "closed", label: "Closed" },
            ]}
          />
        </div>
      </div>

      <div className="mac-card overflow-hidden">
        <div
          className={`hidden md:grid ${COLS} items-center gap-4 border-b border-[var(--mac-sep)] px-4 py-2 mac-label`}
        >
          <MacCheckbox
            checked={allVisible}
            mixed={visibleSelected > 0 && !allVisible}
            onToggle={toggleAll}
            label={allVisible ? "Deselect all" : "Select all"}
          />
          <span>Order</span>
          <span>Customer</span>
          <span>Payment</span>
          <span>Status</span>
          <span className="text-right">Total</span>
        </div>
        <ul>
          {rows.map((o, index) => {
            const href = `/admin/orders/${o.id}`;
            const isSelected = selected.has(o.id);
            return (
              <li
                key={o.id}
                onClick={() => router.push(href)}
                onMouseEnter={() => router.prefetch(href)}
                className={`grid cursor-default grid-cols-[1rem_1fr_auto] items-center gap-x-4 gap-y-1 border-b border-[var(--mac-sep)] px-4 py-2.5 last:border-b-0 transition-colors ${COLS} ${
                  isSelected
                    ? "bg-[color-mix(in_srgb,var(--mac-accent)_8%,white)]"
                    : "hover:bg-[var(--mac-hover)]"
                }`}
              >
                <span className="order-0 row-span-3 self-start pt-0.5 md:row-span-1 md:self-center md:pt-0">
                  <MacCheckbox
                    checked={isSelected}
                    onToggle={(shift) => toggle(index, shift)}
                    label={`Select order ${o.ref}`}
                  />
                </span>
                <Link
                  href={href}
                  onClick={(e) => e.stopPropagation()}
                  className="order-1 flex min-w-0 items-center gap-2.5"
                >
                  <ItemThumbs items={o.order_items ?? []} />
                  <span className="min-w-0">
                    <span className="block truncate">
                      <span className="font-semibold tabular-nums">{o.ref}</span>
                      <span className="text-[12px] text-[var(--mac-secondary)]">
                        {" · "}
                        {new Date(o.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </span>
                    <span className="block truncate text-[12px] text-[var(--mac-secondary)]">
                      {itemSummary(o.order_items ?? [])}
                    </span>
                  </span>
                </Link>
                <span className="order-3 col-span-2 min-w-0 md:order-2 md:col-span-1">
                  <span className="block truncate">{o.name}</span>
                  <span className="block truncate text-[12px] text-[var(--mac-secondary)]">
                    {SHIPPING[o.shipping_method]}
                  </span>
                </span>
                <span className="order-4 hidden md:order-3 md:block">
                  <Pill>{PAYMENT[o.payment_method]}</Pill>
                </span>
                <span className="order-2 justify-self-end md:order-4 md:justify-self-start">
                  <StatusPill status={o.status} downPayment={o.payment_type === "down"} />
                </span>
                <span className="order-5 col-span-2 text-[12px] tabular-nums text-[var(--mac-secondary)] md:col-span-1 md:text-right md:text-[13px] md:text-[var(--mac-text)]">
                  <span className="md:hidden">{PAYMENT[o.payment_method]} · </span>
                  {formatPrice(o.total_cents)}
                </span>
              </li>
            );
          })}
          {rows.length === 0 && (
            <li className="px-4 py-10 text-center text-[var(--mac-secondary)]">
              {orders.length === 0 ? "No orders yet." : "No orders match."}
            </li>
          )}
        </ul>
      </div>

      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="sticky bottom-4 z-10"
          >
            <div className="flex flex-wrap items-center gap-2 rounded-[12px] bg-white/80 px-3 py-2.5 shadow-[0_0_0_0.5px_rgb(0_0_0/0.1),0_8px_24px_rgb(0_0_0/0.10)] backdrop-blur-xl backdrop-saturate-150">
              <span className="px-1 font-medium tabular-nums">
                {selected.size} selected
              </span>
              {deleteError && (
                <span className="text-[12px] text-[#d70015]">{deleteError}</span>
              )}
              <span className="flex-1" />
              <button
                type="button"
                className="mac-btn"
                onClick={() => {
                  setPicked(new Set());
                  anchor.current = null;
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="mac-btn"
                data-variant="danger"
                disabled={deleting}
                onClick={() => setConfirming(true)}
              >
                {deleting
                  ? "Deleting…"
                  : `Delete ${selected.size} order${selected.size === 1 ? "" : "s"}`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirming}
        pending={deleting}
        title={`Delete ${selected.size} order${selected.size === 1 ? "" : "s"}?`}
        message="This permanently removes them and any payment screenshots. Stock won't be returned."
        confirmLabel="Delete"
        onConfirm={removeSelected}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}

// "2× logo tee, 1× cap"
function itemSummary(items: NonNullable<Order["order_items"]>) {
  return items.map((i) => `${i.qty}× ${i.title}`).join(", ") || "No items";
}

// Overlapping thumbnails of what was ordered: up to three, then "+N".
// Hover shows the full item list.
function ItemThumbs({ items }: { items: NonNullable<Order["order_items"]> }) {
  const shown = items.slice(0, 3);
  const extra = items.length - shown.length;
  const summary = items.length ? itemSummary(items) : "";

  return (
    <span className="flex shrink-0 items-center" title={summary || undefined}>
      {shown.map((item, i) => (
        <span
          key={i}
          className={`relative h-9 w-9 overflow-hidden rounded-[8px] bg-[#f0f0f2] ring-2 ring-white ${i > 0 ? "-ml-3.5" : ""}`}
          style={{ zIndex: shown.length - i }}
        >
          {item.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover mix-blend-multiply"
            />
          )}
        </span>
      ))}
      {extra > 0 && (
        <span className="-ml-3.5 flex h-9 min-w-9 items-center justify-center rounded-[8px] bg-[#e5e5ea] px-1 text-[11px] font-semibold text-[var(--mac-secondary)] ring-2 ring-white">
          +{extra}
        </span>
      )}
      {items.length === 0 && (
        <span className="h-9 w-9 rounded-[8px] bg-[#f0f0f2] ring-2 ring-white" />
      )}
    </span>
  );
}
