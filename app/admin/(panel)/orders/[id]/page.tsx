import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import { PAYMENT_TYPES, SHIPPING_METHODS } from "@/lib/checkout-config";
import Link from "next/link";
import AdminWindow from "@/components/admin/admin-window";
import OrderStatusControl from "@/components/admin/order-status-control";
import { PAYMENT, Pill, SHIPPING } from "@/components/admin/order-badges";
import type { Order, OrderItem } from "@/lib/types";

export const metadata = { title: "STAB · Order" };
export const dynamic = "force-dynamic";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-[13px] font-semibold">{title}</h2>
      <div className="mac-card">{children}</div>
    </section>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-[var(--mac-sep)] px-4 py-2.5 last:border-b-0">
      <span className="w-28 shrink-0 text-[var(--mac-secondary)]">{label}</span>
      <span className="min-w-0 flex-1 break-words">{children}</span>
    </div>
  );
}

function Amount({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <div className="mac-card px-4 py-3">
      <div className="mac-label">{label}</div>
      <div
        className="mt-0.5 text-[20px] font-semibold tracking-tight tabular-nums"
        style={tint ? { color: tint } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

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

  const pin = o.address?.pin ?? null;
  const coords = pin?.split(",").map((v) => Number(v.trim())) ?? [];
  const isCoords = coords.length === 2 && coords.every(Number.isFinite);
  const addressLine = o.address
    ? [
        o.address.street,
        o.address.barangay ? `Brgy. ${o.address.barangay}` : null,
        o.address.city,
        o.address.province,
        o.address.postal,
        o.address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <AdminWindow
      title={`Order ${o.ref}`}
      section="orders"
      actions={
        <Link href="/admin/orders" className="mac-btn">
          ‹ Orders
        </Link>
      }
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="mac-card flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="text-[20px] font-semibold tracking-tight tabular-nums">
              {o.ref}
            </div>
            <div className="text-[12px] text-[var(--mac-secondary)]">
              Placed {new Date(o.created_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          </div>
          <OrderStatusControl id={o.id} status={o.status} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Amount label="Total" value={formatPrice(o.total_cents)} />
          <Amount label="Received" value={formatPrice(receivedCents)} />
          <Amount
            label="Balance"
            value={formatPrice(balanceCents)}
            tint={balanceCents > 0 ? "#c93400" : "#248a3d"}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Section title="Customer">
              <Info label="Name">{o.name}</Info>
              <Info label="Email">
                <a href={`mailto:${o.email}`} className="text-[var(--mac-accent)] hover:underline">
                  {o.email}
                </a>
              </Info>
              <Info label="Phone">
                <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="text-[var(--mac-accent)] hover:underline">
                  {o.phone}
                </a>
              </Info>
              <Info label="IG / FB">{o.social_handle || "—"}</Info>
            </Section>

            <Section title="Payment & delivery">
              <Info label="Payment">
                <span className="flex flex-wrap items-center gap-1.5">
                  <Pill>{PAYMENT[o.payment_method]}</Pill>
                  <span className="text-[var(--mac-secondary)]">
                    {PAYMENT_TYPES[o.payment_type].label}
                  </span>
                </span>
              </Info>
              <Info label="Shipping">
                {SHIPPING[o.shipping_method]}
                {shipFeeCents > 0 && (
                  <span className="text-[var(--mac-secondary)]"> · {formatPrice(shipFeeCents)}</span>
                )}
              </Info>
              {pin && (
                <Info label="Pin">
                  {isCoords ? (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${coords[0]}&mlon=${coords[1]}#map=15/${coords[0]}/${coords[1]}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--mac-accent)] hover:underline"
                    >
                      {coords[0].toFixed(5)}, {coords[1].toFixed(5)} · Open map ↗
                    </a>
                  ) : (
                    pin
                  )}
                </Info>
              )}
              {addressLine && <Info label="Address">{addressLine}</Info>}
            </Section>
          </div>

          <div className="flex flex-col gap-6">
            <Section title={`Items · ${orderItems.reduce((n, i) => n + i.qty, 0)}`}>
              {orderItems.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-3 border-b border-[var(--mac-sep)] px-4 py-2.5"
                >
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[8px] bg-[#f0f0f2] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.06)]">
                    {i.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.image} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{i.title}</div>
                    <div className="text-[12px] text-[var(--mac-secondary)]">
                      {i.qty} × {formatPrice(i.unit_price_cents)}
                      {i.variant_label && ` · ${i.variant_label}`}
                    </div>
                  </div>
                  <span className="tabular-nums">{formatPrice(i.unit_price_cents * i.qty)}</span>
                </div>
              ))}
              {shipFeeCents > 0 && (
                <div className="flex justify-between border-b border-[var(--mac-sep)] px-4 py-2.5 text-[var(--mac-secondary)]">
                  <span>Shipping</span>
                  <span className="tabular-nums">{formatPrice(shipFeeCents)}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-2.5 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(o.total_cents)}</span>
              </div>
            </Section>

            <Section title="Proof of payment">
              {proofUrl ? (
                <a href={proofUrl} target="_blank" rel="noreferrer" className="block p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proofUrl}
                    alt="Proof of payment"
                    className="max-h-[28rem] w-full rounded-[8px] object-contain bg-[#f0f0f2]"
                  />
                </a>
              ) : (
                <p className="px-4 py-6 text-center text-[var(--mac-secondary)]">
                  {o.proof_of_payment ? "Couldn't load the proof image." : "No proof uploaded."}
                </p>
              )}
            </Section>
          </div>
        </div>
      </div>
    </AdminWindow>
  );
}
