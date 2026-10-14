"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { deleteOrders } from "@/app/admin/(panel)/actions";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import MacCheckbox from "@/components/admin/mac-checkbox";
import Dropdown from "@/components/admin/dropdown";
import {
  PAYMENT,
  PaymentPill,
  SHIPPING,
  STATUS,
  STATUS_ORDER,
  StatusPill,
} from "@/components/admin/order-badges";
import {
  type OrderQuery,
  orderQueryString,
  PAGE_SIZE,
  type SortKey,
} from "@/lib/admin-orders";
import { formatPrice } from "@/lib/format";
import type { Order, PaymentMethod, ShippingMethod } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "all" as const, label: "All statuses" },
  ...STATUS_ORDER.map((s) => ({
    value: s,
    label: STATUS[s].label,
    color: STATUS[s].color,
    ink: STATUS[s].ink,
  })),
];

const PAYMENT_OPTIONS = [
  { value: "all" as const, label: "All payments" },
  ...(Object.keys(PAYMENT) as PaymentMethod[]).map((p) => ({ value: p, label: PAYMENT[p] })),
];

const SHIPPING_OPTIONS = [
  { value: "all" as const, label: "All shipping" },
  ...(Object.keys(SHIPPING) as ShippingMethod[]).map((m) => ({ value: m, label: SHIPPING[m] })),
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "date:desc", label: "Newest first" },
  { value: "date:asc", label: "Oldest first" },
  { value: "status:asc", label: "Status" },
  { value: "payment:asc", label: "Payment" },
  { value: "shipping:asc", label: "Shipping" },
  { value: "total:desc", label: "Total: high to low" },
  { value: "total:asc", label: "Total: low to high" },
];

// Full class names so Tailwind can see them. The checkbox column only exists
// while selecting.
const COLS = "md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_5rem_8.5rem_7.5rem_6rem]";
const COLS_SELECTING =
  "md:grid-cols-[1rem_minmax(0,1.5fr)_minmax(0,1fr)_5rem_8.5rem_7.5rem_6rem]";

// Mail-style order list. Search, filters, sorting and paging run in the
// database and live in the URL; "Select" turns on multi-select (shift-click
// for a range) for bulk delete, and rows stop opening while it's on.
export default function OrdersTable({
  orders,
  total,
  query,
}: {
  orders: Order[];
  total: number;
  query: OrderQuery;
}) {
  const router = useRouter();
  const [navigating, startNav] = useTransition();
  const [search, setSearch] = useState(query.q);

  const rows = orders;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const anchor = useRef<number | null>(null);
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  // Row being opened: shows a spinner until the detail page replaces this one.
  const [opening, setOpening] = useState<string | null>(null);

  function open(href: string, id: string) {
    if (opening) return;
    setOpening(id);
    router.push(href);
  }

  // Any change other than paging goes back to page 1.
  function go(patch: Partial<OrderQuery>) {
    const next = { ...query, page: 1, ...patch };
    anchor.current = null;
    startNav(() => router.replace(`/admin/orders${orderQueryString(next)}`, { scroll: false }));
  }

  // Debounce typing into the URL.
  useEffect(() => {
    if (search.trim() === query.q.trim()) return;
    const t = setTimeout(() => go({ q: search.trim() }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Clicking a header sorts by it; clicking again flips the direction.
  function sortBy(key: SortKey) {
    go(
      query.sort === key
        ? { dir: query.dir === "asc" ? "desc" : "asc" }
        : { sort: key, dir: key === "total" || key === "date" ? "desc" : "asc" },
    );
  }

  const visibleSelected = rows.filter((o) => picked.has(o.id)).length;
  const allVisible = rows.length > 0 && visibleSelected === rows.length;

  function toggle(index: number, shiftKey: boolean) {
    const id = rows[index].id;
    const next = new Set(picked);
    if (shiftKey && anchor.current != null) {
      // Range select: everything between the anchor and here takes the
      // anchor row's new state.
      const on = !picked.has(id);
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
    const next = new Set(picked);
    rows.forEach((o) => (allVisible ? next.delete(o.id) : next.add(o.id)));
    setPicked(next);
  }

  function stopSelecting() {
    setSelecting(false);
    setPicked(new Set());
    anchor.current = null;
    setDeleteError(null);
  }

  function removeSelected() {
    const ids = [...picked];
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

  const count = picked.size;
  const from = total === 0 ? 0 : (query.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(query.page * PAGE_SIZE, total);
  const filtered =
    query.q || query.status !== "all" || query.payment !== "all" || query.shipping !== "all";

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ref, name, email, phone"
            className="mac-input pl-8! rounded-full! bg-[var(--mac-fill)]! border-transparent! focus:bg-white!"
          />
        </label>
        <Dropdown label="Filter by status" value={query.status} options={STATUS_OPTIONS} onChange={(status) => go({ status })} />
        <Dropdown label="Filter by payment" value={query.payment} options={PAYMENT_OPTIONS} onChange={(payment) => go({ payment })} />
        <Dropdown label="Filter by shipping" value={query.shipping} options={SHIPPING_OPTIONS} onChange={(shipping) => go({ shipping })} />
        <span className="md:hidden">
          <Dropdown
            label="Sort orders"
            value={`${query.sort}:${query.dir}`}
            options={SORT_OPTIONS}
            onChange={(v) => {
              const [sort, dir] = v.split(":");
              go({ sort: sort as SortKey, dir: dir as OrderQuery["dir"] });
            }}
          />
        </span>
        <button
          type="button"
          className="mac-btn md:ml-auto"
          data-variant={selecting ? "primary" : undefined}
          aria-pressed={selecting}
          onClick={() => (selecting ? stopSelecting() : setSelecting(true))}
        >
          {selecting ? "Done" : "Select"}
        </button>
      </div>

      <div className="mac-card overflow-hidden">
        <div
          className={`hidden md:grid ${selecting ? COLS_SELECTING : COLS} items-center gap-4 border-b border-[var(--mac-sep)] px-4 py-2 mac-label`}
        >
          {selecting && (
            <MacCheckbox
              checked={allVisible}
              mixed={visibleSelected > 0 && !allVisible}
              onToggle={toggleAll}
              label={allVisible ? "Deselect page" : "Select page"}
            />
          )}
          <SortHeader label="Order" k="date" sort={query} onSort={sortBy} />
          <span>Contact</span>
          <SortHeader label="Payment" k="payment" sort={query} onSort={sortBy} />
          <SortHeader label="Shipping" k="shipping" sort={query} onSort={sortBy} />
          <SortHeader label="Status" k="status" sort={query} onSort={sortBy} />
          <SortHeader label="Total" k="total" sort={query} onSort={sortBy} right />
        </div>
        <ul className={`transition-opacity ${navigating ? "opacity-60" : ""}`}>
          {rows.map((o, index) => {
            const href = `/admin/orders/${o.id}`;
            const isSelected = picked.has(o.id);
            const isOpening = opening === o.id;
            return (
              <li
                key={o.id}
                onClick={(e) => (selecting ? toggle(index, e.shiftKey) : open(href, o.id))}
                aria-busy={isOpening || undefined}
                onMouseEnter={() => !selecting && router.prefetch(href)}
                className={`relative grid cursor-default select-none items-center gap-x-4 gap-y-1 border-b border-[var(--mac-sep)] px-4 py-2.5 last:border-b-0 transition-[background-color,transform] active:scale-[0.995] active:bg-[color-mix(in_srgb,var(--mac-accent)_14%,white)] ${
                  selecting ? `grid-cols-[1rem_1fr_auto] ${COLS_SELECTING}` : `grid-cols-[1fr_auto] ${COLS}`
                } ${
                  isOpening
                    ? "bg-[color-mix(in_srgb,var(--mac-accent)_10%,white)]"
                    : isSelected
                      ? "bg-[color-mix(in_srgb,var(--mac-accent)_8%,white)]"
                      : "hover:bg-[var(--mac-hover)]"
                }`}
              >
                {selecting && (
                  <span className="order-0 row-span-3 self-start pt-0.5 md:row-span-1 md:self-center md:pt-0">
                    <MacCheckbox
                      checked={isSelected}
                      onToggle={(shift) => toggle(index, shift)}
                      label={`Select order ${o.ref}`}
                    />
                  </span>
                )}
                <Link
                  href={href}
                  prefetch={false}
                  onClick={(e) => {
                    // While selecting, the row click toggles instead.
                    if (selecting) {
                      e.preventDefault();
                    } else {
                      e.stopPropagation();
                      setOpening(o.id);
                    }
                  }}
                  className="order-1 flex min-w-0 items-center gap-2.5"
                >
                  <ItemThumbs items={o.order_items ?? []} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{o.name}</span>
                    <span className="block truncate text-[0.75rem] text-[var(--mac-secondary)]">
                      {itemSummary(o.order_items ?? [])}
                    </span>
                    <span className="block truncate text-[0.6875rem] text-[var(--mac-secondary)]/80">
                      <span className="tabular-nums">{o.ref}</span>
                      {" · "}
                      {new Date(o.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </Link>
                <span className="order-3 col-span-2 min-w-0 md:order-2 md:col-span-1">
                  <span className="block truncate text-[0.75rem] text-[var(--mac-secondary)] md:hidden">
                    {SHIPPING[o.shipping_method]}
                  </span>
                  <span className="hidden truncate md:block">{o.email}</span>
                  <span className="hidden truncate text-[0.75rem] text-[var(--mac-secondary)] md:block">
                    {o.phone}
                  </span>
                </span>
                <span className="order-4 hidden md:order-3 md:block">
                  <PaymentPill method={o.payment_method} />
                </span>
                <span className="order-4 hidden min-w-0 truncate md:order-4 md:block">
                  {SHIPPING[o.shipping_method]}
                </span>
                <span className="order-2 justify-self-end md:order-5 md:justify-self-start">
                  <StatusPill status={o.status} downPayment={o.payment_type === "down"} />
                </span>
                <span className="order-6 col-span-2 text-[0.75rem] tabular-nums text-[var(--mac-secondary)] md:col-span-1 md:text-right md:text-[0.8125rem] md:text-[var(--mac-text)]">
                  <span className="md:hidden">{PAYMENT[o.payment_method]} · </span>
                  {formatPrice(o.total_cents)}
                </span>
                {isOpening && (
                  <span
                    role="status"
                    aria-label="Opening order"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <svg viewBox="0 0 16 16" className="h-4 w-4 animate-spin text-[var(--mac-accent)]">
                      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                      <path d="M14 8a6 6 0 0 0-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                )}
              </li>
            );
          })}
          {rows.length === 0 && (
            <li className="px-4 py-10 text-center text-[var(--mac-secondary)]">
              {filtered ? "No orders match." : "No orders yet."}
            </li>
          )}
        </ul>
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between gap-3 px-1 text-[0.8125rem] text-[var(--mac-secondary)]">
          <span className="tabular-nums">
            {from}–{to} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="mac-btn"
              disabled={query.page <= 1 || navigating}
              onClick={() => go({ page: query.page - 1 })}
            >
              ‹ Prev
            </button>
            <span className="tabular-nums">
              {query.page} / {pages}
            </span>
            <button
              type="button"
              className="mac-btn"
              disabled={query.page >= pages || navigating}
              onClick={() => go({ page: query.page + 1 })}
            >
              Next ›
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selecting && count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="sticky bottom-4 z-10"
          >
            <div className="flex flex-wrap items-center gap-2 rounded-[12px] bg-white/80 px-3 py-2.5 shadow-[0_0_0_0.5px_rgb(0_0_0/0.1),0_8px_24px_rgb(0_0_0/0.10)] backdrop-blur-xl backdrop-saturate-150">
              <span className="px-1 font-medium tabular-nums">{count} selected</span>
              {deleteError && (
                <span className="text-[0.75rem] text-[#d70015]">{deleteError}</span>
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
                {deleting ? "Deleting…" : `Delete ${count} order${count === 1 ? "" : "s"}`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirming}
        pending={deleting}
        title={`Delete ${count} order${count === 1 ? "" : "s"}?`}
        message="This permanently removes them and any payment screenshots. Stock won't be returned."
        confirmLabel="Delete"
        onConfirm={removeSelected}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}

function SortHeader({
  label,
  k,
  sort,
  onSort,
  right,
}: {
  label: string;
  k: SortKey;
  sort: Pick<OrderQuery, "sort" | "dir">;
  onSort: (k: SortKey) => void;
  right?: boolean;
}) {
  const on = sort.sort === k;
  return (
    <button
      type="button"
      onClick={() => onSort(k)}
      title={on ? `Sorted ${sort.dir === "asc" ? "ascending" : "descending"}` : `Sort by ${label.toLowerCase()}`}
      className={`mac-label inline-flex items-center gap-1 hover:text-[var(--mac-text)] ${
        right ? "justify-end" : ""
      } ${on ? "text-[var(--mac-text)]" : ""}`}
    >
      {label}
      <svg
        aria-hidden
        viewBox="0 0 8 8"
        className={`h-2 w-2 transition-transform ${on ? "" : "opacity-0"} ${
          on && sort.dir === "asc" ? "rotate-180" : ""
        }`}
        fill="currentColor"
      >
        <path d="M4 6.5 0.5 2h7z" />
      </svg>
    </button>
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
        <span className="-ml-3.5 flex h-9 min-w-9 items-center justify-center rounded-[8px] bg-[#e5e5ea] px-1 text-[0.6875rem] font-semibold text-[var(--mac-secondary)] ring-2 ring-white">
          +{extra}
        </span>
      )}
      {items.length === 0 && (
        <span className="h-9 w-9 rounded-[8px] bg-[#f0f0f2] ring-2 ring-white" />
      )}
    </span>
  );
}
