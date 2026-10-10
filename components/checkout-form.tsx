"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import AddressSearch from "@/components/address-search";
import { EmptyState, Thumb } from "@/components/cart-view";
import { useCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/configured";
import { placeOrder } from "@/app/checkout/actions";
import {
  PAYMENT_METHODS,
  PAYMENT_TYPES,
  SHIPPING_METHODS,
} from "@/lib/checkout-config";
import { formatPhPhone, formatPrice, isCompletePhPhone } from "@/lib/format";
import type { PaymentMethod, PaymentType, ShippingMethod } from "@/lib/types";

const inputCls = "mac-input h-10!";
const labelCls = "block text-[12px] font-medium text-faded mb-1.5";
const segCls = "flex flex-wrap gap-2";
const radioCls = (active: boolean) =>
  `mac-btn h-9! px-3.5! ${active ? "bg-[var(--mac-accent)]! text-white!" : ""}`;

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel p-5 md:p-6 grid md:grid-cols-[140px_1fr] gap-4">
      <h2 className="text-[15px] font-semibold tracking-tight">
        <span className="text-faded mr-2 tabular-nums">{n}</span>
        {title}
      </h2>
      <div className="flex flex-col gap-5 max-w-xl">{children}</div>
    </section>
  );
}

export default function CheckoutForm() {
  const { items, subtotalCents, clear, hydrated } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [social, setSocial] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("gcash");
  const [payType, setPayType] = useState<PaymentType>("full");
  const [shipping, setShipping] = useState<ShippingMethod>("pickup");
  const [addr, setAddr] = useState({
    street: "",
    barangay: "",
    city: "",
    province: "",
    postal: "",
    country: "",
    pin: "",
  });
  const [proof, setProof] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{
    ref: string;
    merchCents: number;
    shippingFeeCents: number;
    payType: PaymentType;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const configured = isSupabaseConfigured();

  if (!hydrated) return <div className="px-4 py-24" />;

  if (placed) {
    // Down payment: 50% of merch + shipping fee in full.
    const dueNow =
      placed.payType === "down"
        ? Math.ceil(placed.merchCents / 2) + placed.shippingFeeCents
        : placed.merchCents + placed.shippingFeeCents;
    const balance = placed.merchCents + placed.shippingFeeCents - dueNow;
    return (
      <div className="px-4 py-20 flex flex-col items-center gap-6">
        <p className="tag text-faded">Order received</p>
        <h1 className="text-[28px] font-bold tracking-tight tabular-nums">
          {placed.ref}
        </h1>
        <table className="w-full max-w-md panel [&_td]:px-5 [&_tr:first-child_td]:pt-4 [&_tr:last-child_td]:pb-4">
          <tbody>
            <tr>
              <td className="py-2 tag text-faded">Pay now</td>
              <td className="py-2 text-right text-accent">
                {formatPrice(dueNow)}
              </td>
            </tr>
            {balance > 0 && (
              <tr>
                <td className="py-2 tag text-faded">Balance on handoff</td>
                <td className="py-2 text-right">{formatPrice(balance)}</td>
              </tr>
            )}
            <tr>
              <td className="py-2 pr-4 tag text-faded align-top">
                {PAYMENT_METHODS[payment].label}
              </td>
              <td className="py-2 text-right">
                {PAYMENT_METHODS[payment].instructions}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-faded text-center max-w-sm">
          We&apos;ll confirm your order once payment is verified.
        </p>
        <Link
          href="/"
          className="mac-btn"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState line="Your cart is empty" />;
  }

  function submit() {
    setError(null);
    if (!isCompletePhPhone(phone)) {
      setError("Enter your full phone number, like +63 999 616 6666");
      return;
    }
    startTransition(async () => {
      try {
        let proofPath: string | undefined;
        if (proof) {
          if (!configured) return setError("Supabase not configured");
          const supabase = createClient();
          const ext = proof.name.split(".").pop() ?? "jpg";
          const path = `${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("payment-proofs")
            .upload(path, proof);
          if (upErr) return setError("Proof upload failed, try again");
          proofPath = path;
        }

        const result = await placeOrder({
          name,
          email,
          phone,
          socialHandle: social,
          paymentMethod: payment,
          paymentType: payType,
          proofPath,
          shippingMethod: shipping,
          address: shipping === "pickup" ? undefined : addr,
          items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
        });

        if ("error" in result) {
          setError(result.error);
        } else {
          setPlaced({
            ref: result.ref,
            merchCents: subtotalCents,
            shippingFeeCents: SHIPPING_METHODS[shipping].feeCents,
            payType,
          });
          clear();
        }
      } catch {
        setError("Something went wrong, try again");
      }
    });
  }

  const feeCents = SHIPPING_METHODS[shipping].feeCents;
  const totalCents = subtotalCents + feeCents;

  return (
    <div className="pt-5 grid lg:grid-cols-[1fr_380px] gap-4 lg:gap-6 items-start">
      {/* Order summary: top on mobile, sticky sidebar on desktop */}
      <aside className="lg:order-2 lg:sticky lg:top-6 panel p-5">
        <div>
          <h2 className="tag text-faded mb-3">Your order</h2>
          <ul>
            {items.map((item) => (
              <li
                key={item.variantId}
                className="py-2 flex items-center gap-3"
              >
                <Thumb src={item.image} title={item.title} slug={item.slug} className="w-11 h-11" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold tracking-tight leading-tight truncate">
                    {item.title}
                  </p>
                  <p className="text-faded">
                    {item.qty}× · {item.variantLabel}
                  </p>
                </div>
                <span>{formatPrice(item.unitPriceCents * item.qty)}</span>
              </li>
            ))}
          </ul>
          <table className="w-full mt-2">
            <tbody>
              <tr>
                <td className="py-2 tag text-faded">Subtotal</td>
                <td className="py-2 text-right">{formatPrice(subtotalCents)}</td>
              </tr>
              {feeCents > 0 && (
                <tr>
                  <td className="py-2 tag text-faded">
                    {SHIPPING_METHODS[shipping].label}
                  </td>
                  <td className="py-2 text-right">{formatPrice(feeCents)}</td>
                </tr>
              )}
              <tr className="border-t border-line">
                <td className="pt-3 pb-2 tag">Total</td>
                <td className="pt-3 pb-2 text-right font-medium">
                  {formatPrice(totalCents)}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-faded leading-relaxed">
            {SHIPPING_METHODS[shipping].note}
          </p>
        </div>
      </aside>

      {/* Form */}
      <div className="lg:order-1 flex flex-col gap-4">
        <Step n="01" title="Contact">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Name</label>
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                className={inputCls}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                className={inputCls}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+63 999 616 6666"
                value={phone}
                // Prefill the country code on tap; drop it again if nothing
                // was typed so the placeholder comes back.
                onFocus={() => !phone && setPhone("+63 ")}
                onBlur={() => phone.trim() === "+63" && setPhone("")}
                onChange={(e) => setPhone(formatPhPhone(e.target.value))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>IG / FB handle (optional)</label>
              <input
                className={inputCls}
                value={social}
                onChange={(e) => setSocial(e.target.value)}
                placeholder="@you"
              />
            </div>
          </div>
        </Step>

        <Step n="02" title="Payment">
          <div>
            <label className={labelCls}>Payment method</label>
            <div className={segCls}>
              {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPayment(m)}
                  aria-pressed={payment === m}
                  className={radioCls(payment === m)}
                >
                  {PAYMENT_METHODS[m].label}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-faded">
              {PAYMENT_METHODS[payment].instructions}
            </p>
          </div>

          <div>
            <label className={labelCls}>Payment type</label>
            <div className={segCls}>
              {(Object.keys(PAYMENT_TYPES) as PaymentType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPayType(t)}
                  aria-pressed={payType === t}
                  className={radioCls(payType === t)}
                >
                  {PAYMENT_TYPES[t].label}
                </button>
              ))}
            </div>
        
          </div>

          <div>
            <label className={labelCls}>Proof of payment (screenshot)</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`px-4 py-6 w-full rounded-[10px] text-[13px] font-medium transition-colors ${
                proof
                  ? "bg-[var(--mac-accent)] text-white"
                  : "border border-dashed border-[rgb(0_0_0/0.18)] bg-white/50 text-faded hover:border-ink/40 hover:text-ink"
              }`}
            >
              {proof ? `✓ ${proof.name}` : "+ Upload screenshot"}
            </button>
            <p className="mt-2 text-faded">
           
            </p>
          </div>
        </Step>

        <Step n="03" title="Shipping">
          <div>
            <label className={labelCls}>Shipping method</label>
            <div className={segCls}>
              {(Object.keys(SHIPPING_METHODS) as ShippingMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setShipping(m)}
                  aria-pressed={shipping === m}
                  className={radioCls(shipping === m)}
                >
                  {SHIPPING_METHODS[m].label}
                </button>
              ))}
            </div>
          </div>

          {shipping === "maxim_lalamove" && (
            <div>
              <label className={labelCls}>Where to pin the location</label>
              <input
                className={inputCls}
                value={addr.pin}
                onChange={(e) => setAddr({ ...addr, pin: e.target.value })}
                placeholder="Landmark / pin location (e.g. condo lobby, Jollibee corner)"
              />
            </div>
          )}

          {(shipping === "jnt" || shipping === "international") && (
            <div>
              <label className={labelCls}>
                Delivery address
                {shipping === "international" ? "" : " · Philippines"}
              </label>
              {shipping === "international" && (
                <div className="mb-3">
                  <AddressSearch
                    onSelect={(a) => setAddr((prev) => ({ ...prev, ...a }))}
                  />
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="sm:col-span-2">
                  <input
                    className={inputCls}
                    value={addr.street}
                    onChange={(e) =>
                      setAddr({ ...addr, street: e.target.value })
                    }
                    placeholder="Street / house no."
                  />
                </div>
                {shipping !== "international" && (
                  <input
                    className={inputCls}
                    value={addr.barangay}
                    onChange={(e) =>
                      setAddr({ ...addr, barangay: e.target.value })
                    }
                    placeholder="Barangay"
                  />
                )}
                <input
                  className={inputCls}
                  value={addr.city}
                  onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                  placeholder={
                    shipping === "international" ? "City" : "City / municipality"
                  }
                />
                <input
                  className={inputCls}
                  value={addr.province}
                  onChange={(e) =>
                    setAddr({ ...addr, province: e.target.value })
                  }
                  placeholder={
                    shipping === "international" ? "State / province" : "Province"
                  }
                />
                <input
                  className={inputCls}
                  value={addr.postal}
                  onChange={(e) => setAddr({ ...addr, postal: e.target.value })}
                  placeholder="Postal code"
                  inputMode="numeric"
                />
                {shipping === "international" && (
                  <input
                    className={`${inputCls} sm:col-span-2`}
                    value={addr.country}
                    onChange={(e) =>
                      setAddr({ ...addr, country: e.target.value })
                    }
                    placeholder="Country"
                  />
                )}
              </div>
            </div>
          )}
        </Step>

        <div className="flex flex-col gap-3">
          {error && <p className="text-accent">● {error}</p>}
          <button
            onClick={submit}
            disabled={pending}
            className="btn-primary w-full justify-between"
          >
            <span>{pending ? "Placing order…" : "Place order"}</span>
            <span>{formatPrice(totalCents)} →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
