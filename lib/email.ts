import "server-only";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { formatPrice } from "@/lib/format";
import {
  PAYMENT_METHODS,
  PAYMENT_TYPES,
  SHIPPING_METHODS,
} from "@/lib/checkout-config";
import { adminEmail } from "@/lib/admin-email";
import { siteUrl } from "@/lib/site";
import type { PaymentMethod, PaymentType, ShippingMethod } from "@/lib/types";

export interface OrderEmailData {
  ref: string;
  name: string;
  email: string;
  phone: string;
  socialHandle: string | null;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  shippingMethod: ShippingMethod;
  address: Record<string, string> | null;
  items: {
    title: string;
    variantLabel: string;
    qty: number;
    unitCents: number;
    image: string | null;
  }[];
  shippingFeeCents: number;
  totalCents: number;
}

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

// Where new-order alerts go. ADMIN_EMAIL is the login address and defaults to
// a placeholder, so it only counts when it's a real one.
function notifyAddress() {
  const explicit = process.env.ORDER_NOTIFY_EMAIL?.trim();
  if (explicit) return explicit;
  const admin = adminEmail();
  return admin.endsWith("@stab.local") ? null : admin;
}

function addressLines(o: OrderEmailData) {
  const a = o.address;
  if (!a) return o.shippingMethod === "pickup" ? "Pickup at a show" : "";
  if (a.pin) return `Pin: ${a.pin}`;
  return [a.street, a.barangay, a.city, a.province, a.postal, a.country]
    .filter(Boolean)
    .join(", ");
}

// Photos are uploaded at full size (some are multi-MB PNGs). Route them
// through the site's own image optimizer so the email downloads a 128px
// thumbnail instead. Without a public site URL (local dev) the original is used.
function thumb(src: string) {
  const site = siteUrl();
  return site
    ? `${site}/_next/image?url=${encodeURIComponent(src)}&w=128&q=75`
    : src;
}

function itemsTable(o: OrderEmailData) {
  const rows = o.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 12px 8px 0;width:64px;vertical-align:top">${
          i.image
            ? `<img src="${esc(thumb(i.image))}" alt="" width="64" style="display:block;width:64px;height:auto;border-radius:8px;background:#ffffff">`
            : ""
        }</td>
        <td style="padding:8px 0;vertical-align:top">${esc(i.title)}<br><span style="color:#6e6e73;font-size:13px">${esc(i.variantLabel)} × ${i.qty}</span></td>
        <td style="padding:8px 0;text-align:right;white-space:nowrap;vertical-align:top">${formatPrice(i.unitCents * i.qty)}</td>
      </tr>`,
    )
    .join("");
  const subtotal = o.totalCents - o.shippingFeeCents;
  return `<table style="width:100%;border-collapse:collapse;font-size:15px">
    ${rows}
    <tr><td colspan="2" style="padding:10px 0 2px;border-top:1px solid #dcd7cb;color:#6e6e73">Subtotal</td><td style="padding:10px 0 2px;border-top:1px solid #dcd7cb;text-align:right">${formatPrice(subtotal)}</td></tr>
    <tr><td colspan="2" style="padding:2px 0;color:#6e6e73">Shipping</td><td style="padding:2px 0;text-align:right">${o.shippingFeeCents ? formatPrice(o.shippingFeeCents) : "Free"}</td></tr>
    <tr><td colspan="2" style="padding:6px 0;font-weight:600">Total</td><td style="padding:6px 0;text-align:right;font-weight:600">${formatPrice(o.totalCents)}</td></tr>
  </table>`;
}

function layout(inner: string) {
  return `<div style="background:#f4f1ea;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;color:#1d1d1f">
    <div style="max-width:520px;margin:0 auto;background:#f9f6ef;border-radius:14px;padding:24px">${inner}</div>
  </div>`;
}

function customerHtml(o: OrderEmailData) {
  const method = PAYMENT_METHODS[o.paymentMethod];
  const due =
    o.paymentType === "down" ? Math.ceil(o.totalCents / 2) : o.totalCents;
  const instructions = method.instructions
    ? `<p style="margin:8px 0 0;white-space:pre-line">${esc(method.instructions)}</p>`
    : "";
  return layout(`
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:600">Order ${esc(o.ref)} received</h1>
    <p style="margin:0 0 20px;color:#6e6e73">Thanks ${esc(o.name)}, we'll confirm once your payment is verified.</p>
    ${itemsTable(o)}
    <h2 style="margin:24px 0 4px;font-size:15px">Payment</h2>
    <p style="margin:0">${esc(PAYMENT_TYPES[o.paymentType].label)} via ${esc(method.label)}: <strong>${formatPrice(due)}</strong></p>
    ${instructions}
    <h2 style="margin:24px 0 4px;font-size:15px">Shipping</h2>
    <p style="margin:0">${esc(SHIPPING_METHODS[o.shippingMethod].label)}</p>
    ${addressLines(o) ? `<p style="margin:4px 0 0;color:#6e6e73">${esc(addressLines(o))}</p>` : ""}
    <p style="margin:24px 0 0;font-size:13px;color:#6e6e73">Keep your reference <strong>${esc(o.ref)}</strong> if you need to message us about this order.</p>
  `);
}

function adminHtml(o: OrderEmailData) {
  return layout(`
    <h1 style="margin:0 0 4px;font-size:20px;font-weight:600">New order ${esc(o.ref)}</h1>
    <p style="margin:0 0 16px;color:#6e6e73">${esc(o.name)} · ${esc(o.email)} · ${esc(o.phone)}${o.socialHandle ? ` · ${esc(o.socialHandle)}` : ""}</p>
    ${itemsTable(o)}
    <p style="margin:16px 0 0">${esc(PAYMENT_TYPES[o.paymentType].label)} via ${esc(PAYMENT_METHODS[o.paymentMethod].label)}<br>${esc(SHIPPING_METHODS[o.shippingMethod].label)}${addressLines(o) ? `: ${esc(addressLines(o))}` : ""}</p>
  `);
}

interface Mail {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

// Gmail SMTP when SMTP_USER and SMTP_PASS (a Google app password) are set;
// no domain needed. Otherwise Resend, which only delivers to arbitrary
// recipients once a domain is verified there. Returns null when neither is
// configured, so local dev without keys sends nothing.
function mailer(): ((mail: Mail) => Promise<void>) | null {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");
  if (user && pass) {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });
    const from = process.env.SMTP_FROM?.trim() || `STAB <${user}>`;
    return async (mail) => {
      await transport.sendMail({ from, ...mail });
    };
  }

  const key = process.env.RESEND_API_KEY;
  if (key) {
    const resend = new Resend(key);
    const from =
      process.env.RESEND_FROM?.trim() || "STAB <onboarding@resend.dev>";
    return async ({ replyTo, ...mail }) => {
      const { error } = await resend.emails.send({
        from,
        ...mail,
        ...(replyTo ? { replyTo } : {}),
      });
      if (error) throw new Error(error.message);
    };
  }

  return null;
}

// Sends the customer's confirmation and the admin alert. Never throws: a mail
// problem must not turn a placed order into an error.
export async function sendOrderEmails(order: OrderEmailData) {
  const send = mailer();
  if (!send) return;
  const notify = notifyAddress();

  const jobs = [
    send({
      to: order.email,
      subject: `STAB order ${order.ref} received`,
      html: customerHtml(order),
      ...(notify ? { replyTo: notify } : {}),
    }),
    ...(notify
      ? [
          send({
            to: notify,
            subject: `New order ${order.ref} · ${formatPrice(order.totalCents)}`,
            html: adminHtml(order),
            replyTo: order.email,
          }),
        ]
      : []),
  ];

  const results = await Promise.allSettled(jobs);
  for (const r of results) {
    if (r.status === "rejected") console.error("Order email failed:", r.reason);
  }
}
