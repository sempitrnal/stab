import Link from "next/link";
import { getAllOrders, getProductTally } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { signOut } from "../actions";
import type { OrderStatus, PaymentMethod, ShippingMethod } from "@/lib/types";

export const metadata = { title: "STAB · Orders" };
export const dynamic = "force-dynamic";

const badgeCls =
  "inline-block font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 leading-none whitespace-nowrap";

const PAYMENT_BADGE: Record<PaymentMethod, string> = {
  gcash: "bg-[#2471F2] text-white",
  bank_transfer: "bg-[#0FE4EB] text-white",
  paypal: "bg-[#0070BA] text-white",
};

const PAYMENT_SHORT: Record<PaymentMethod, string> = {
  gcash: "GCash",
  bank_transfer: "Bank",
  paypal: "PayPal",
};

const SHIPPING_SHORT: Record<ShippingMethod, string> = {
  pickup: "Pickup",
  maxim_lalamove: "Maxim/Lala",
  jnt: "J&T",
  international: "Intl",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-[#B45309] text-white",
  half_paid: "bg-[#2471F2] text-white",
  paid: "bg-[#15803D] text-white",
  fulfilled: "bg-ink text-paper",
  cancelled: "bg-[#8A8A8A] text-white",
  refunded: "bg-accent text-paper",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  half_paid: "Half paid",
  paid: "Paid",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default async function OrdersPage() {
  const [orders, tally] = await Promise.all([
    getAllOrders(),
    getProductTally(),
  ]);

  return (
    <div className="px-4 py-6 flex flex-col gap-10">
      <div className="flex items-center justify-between border-b border-ink/15 pb-3">
        <h1 className="font-black uppercase tracking-tight text-2xl">Admin</h1>
        <div className="flex items-center gap-6">
          <Link
            href="/admin"
            className="font-mono text-[11px] uppercase tracking-widest text-faded hover:text-accent"
          >
            Products
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-widest underline underline-offset-4">
            Orders
          </span>
          <form action={signOut}>
            <button className="font-mono text-[11px] uppercase tracking-widest text-faded hover:text-accent">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {tally.length > 0 && (
        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-faded mb-2">
            Sold
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
            {tally.map((t) => (
              <div key={t.title} className="border-t border-ink/15">
                <div className="py-2 flex items-baseline gap-3">
                  <span className="font-bold uppercase text-sm tracking-tight truncate">
                    {t.title}
                  </span>
                  <span className="flex-1" />
                  <span className="font-mono text-xs shrink-0">
                    {t.totalQty}
                  </span>
                </div>
                <ul>
                  {t.variants.map((v) => (
                    <li
                      key={v.label}
                      className="border-t border-ink/10 py-1.5 pl-4 flex items-baseline gap-3 font-mono text-[11px]"
                    >
                      <span className="uppercase text-faded">{v.label}</span>
                      <span className="flex-1" />
                      <span className="text-faded">×{v.qty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-faded mb-2">
          Orders · {orders.length}
        </h2>
        <ul className="sm:border-t sm:border-ink/15">
          {orders.map((o) => (
            <li
              key={o.id}
              className="border border-ink/15 mb-2 last:mb-0 sm:mb-0 sm:border-0 sm:border-b"
            >
              <Link
                href={`/admin/orders/${o.id}`}
                className="p-3 sm:p-0 sm:py-3 flex flex-wrap items-center gap-x-3 gap-y-2.5 sm:gap-4 font-mono text-xs hover:bg-bone/50 transition-colors"
              >
                <span className="shrink-0 font-bold sm:font-normal sm:order-1 sm:w-20">
                  {o.ref}
                </span>
                <span className="text-faded sm:order-2">
                  {new Date(o.created_at).toLocaleDateString()}
                </span>
                <span
                  className={`${badgeCls} ${STATUS_BADGE[o.status]} ml-auto sm:ml-0 sm:order-6`}
                >
                  {STATUS_LABEL[o.status]}
                  {o.payment_type === "down" && o.status === "half_paid"
                    ? " 50%"
                    : ""}
                </span>
                <span className="basis-full min-w-0 truncate sm:basis-auto sm:flex-1 sm:order-3">
                  {o.name}
                </span>
                <span
                  className={`${badgeCls} ${PAYMENT_BADGE[o.payment_method]} sm:order-4`}
                >
                  {PAYMENT_SHORT[o.payment_method]}
                </span>
                <span className={`${badgeCls} border border-ink/25 sm:order-5`}>
                  {SHIPPING_SHORT[o.shipping_method]}
                </span>
                <span className="ml-auto sm:ml-0 sm:w-16 text-right shrink-0 sm:order-7">
                  {formatPrice(o.total_cents)}
                </span>
              </Link>
            </li>
          ))}
          {orders.length === 0 && (
            <li className="py-8 text-center font-mono text-xs uppercase tracking-widest text-faded">
              No orders yet
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
