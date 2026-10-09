import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import {
  PAYMENT_METHODS,
  PAYMENT_TYPES,
  SHIPPING_METHODS,
} from "@/lib/checkout-config";
import OrderStatusControl from "@/components/admin/order-status-control";
import type { Order, OrderItem } from "@/lib/types";

export const metadata = { title: "STAB · Order" };
export const dynamic = "force-dynamic";

const fieldCls = "font-mono text-[10px] uppercase tracking-widest text-faded";
const valueCls = "font-mono text-xs";

export default async function OrderPage(
  props: PageProps<"/admin/orders/[id]">,
) {
  const { id } = await props.params;
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  const o = order as Order;
  const orderItems = (items ?? []) as OrderItem[];

  const shipFeeCents = SHIPPING_METHODS[o.shipping_method].feeCents;
  const merchCents = o.total_cents - shipFeeCents;
  // Down payment orders: half_paid = 50% of merch + shipping in full.
  const receivedCents =
    o.status === "paid" || o.status === "fulfilled" || o.status === "refunded"
      ? o.total_cents
      : o.status === "half_paid"
        ? Math.ceil(merchCents / 2) + shipFeeCents
        : 0;
  const balanceCents = o.total_cents - receivedCents;

  // Private bucket: generate a short-lived signed URL to view the proof.
  let proofUrl: string | null = null;
  if (o.proof_of_payment) {
    const { data } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(o.proof_of_payment, 60 * 60);
    proofUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="px-4 py-6 max-w-3xl flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/15 pb-3">
        <h1 className="font-black uppercase tracking-tight text-2xl">
          {o.ref}
        </h1>
        <OrderStatusControl id={o.id} status={o.status} />
      </div>

      <section className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <p className={fieldCls}>Name</p>
          <p className={valueCls}>{o.name}</p>
        </div>
        <div>
          <p className={fieldCls}>Email</p>
          <p className={valueCls}>{o.email}</p>
        </div>
        <div>
          <p className={fieldCls}>Phone</p>
          <p className={valueCls}>{o.phone}</p>
        </div>
        <div>
          <p className={fieldCls}>IG / FB</p>
          <p className={valueCls}>{o.social_handle ?? "·"}</p>
        </div>
        <div>
          <p className={fieldCls}>Payment</p>
          <p className={valueCls}>
            {PAYMENT_METHODS[o.payment_method].label} ·{" "}
            {PAYMENT_TYPES[o.payment_type].label}
          </p>
        </div>
        <div>
          <p className={fieldCls}>Received / Balance</p>
          <p className={valueCls}>
            {formatPrice(receivedCents)} /{" "}
            <span className={balanceCents > 0 ? "text-accent" : ""}>
              {formatPrice(balanceCents)}
            </span>
          </p>
        </div>
        <div>
          <p className={fieldCls}>Shipping</p>
          <p className={valueCls}>
            {SHIPPING_METHODS[o.shipping_method].label}
          </p>
        </div>
        {o.address && (
          <div className="sm:col-span-2">
            <p className={fieldCls}>Address</p>
            {o.address.pin &&
              (() => {
                const coords = o.address.pin.split(",").map((s) => s.trim());
                const [lat, lng] = coords.map(Number);
                const isCoords =
                  coords.length === 2 &&
                  Number.isFinite(lat) &&
                  Number.isFinite(lng);
                return isCoords ? (
                  <p className={valueCls}>
                    Pin:{" "}
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4 hover:text-accent"
                    >
                      {lat.toFixed(5)}, {lng.toFixed(5)} · open map
                    </a>
                  </p>
                ) : (
                  <p className={valueCls}>Pin: {o.address.pin}</p>
                );
              })()}
            <p className={`${valueCls} whitespace-pre-line`}>
              {[
                o.address.street,
                o.address.barangay ? `Brgy. ${o.address.barangay}` : null,
                o.address.city,
                o.address.province,
                o.address.postal,
                o.address.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        )}
        <div>
          <p className={fieldCls}>Placed</p>
          <p className={valueCls}>{new Date(o.created_at).toLocaleString()}</p>
        </div>
      </section>

      <section>
        <h2 className={`${fieldCls} mb-2`}>Items</h2>
        <ul className="border-t border-ink/15">
          {orderItems.map((i) => (
            <li
              key={i.id}
              className="border-b border-ink/15 py-2 flex items-center gap-3 font-mono text-xs"
            >
              <div className="relative w-10 h-12 bg-bone shrink-0 overflow-hidden flex items-center justify-center">
                {i.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={i.image}
                    alt={i.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[8px] uppercase tracking-widest text-ink/40 px-1 text-center leading-tight">
                    {i.title}
                  </span>
                )}
              </div>
              <span className="text-faded shrink-0">{i.qty}×</span>
              <span className="flex-1 min-w-0 uppercase truncate">
                {i.title}
              </span>
              <span className="text-faded uppercase text-[10px] hidden sm:inline">
                {i.variant_label}
              </span>
              <span className="shrink-0">
                {formatPrice(i.unit_price_cents * i.qty)}
              </span>
            </li>
          ))}
          {shipFeeCents > 0 && (
            <li className="py-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-faded">
              <span>
                Shipping · {SHIPPING_METHODS[o.shipping_method].label}
              </span>
              <span>{formatPrice(shipFeeCents)}</span>
            </li>
          )}
          <li className="py-2 flex justify-between font-mono text-xs uppercase tracking-widest">
            <span>Total</span>
            <span>{formatPrice(o.total_cents)}</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className={`${fieldCls} mb-2`}>Proof of payment</h2>
        {proofUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={proofUrl}
            alt="Proof of payment"
            className="max-w-sm border border-ink/15"
          />
        ) : (
          <p className={valueCls}>
            {o.proof_of_payment
              ? "Could not load proof image"
              : "No proof uploaded"}
          </p>
        )}
      </section>
    </div>
  );
}
