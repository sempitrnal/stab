import { getAllOrders, getProductTally } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import AdminWindow from "@/components/admin/admin-window";
import OrdersTable from "@/components/admin/orders-table";

export const metadata = { title: "STAB · Orders" };
export const dynamic = "force-dynamic";

function Stat({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <div className="mac-card px-4 py-3">
      <div className="mac-label">{label}</div>
      <div
        className="mt-0.5 text-[22px] font-semibold tracking-tight tabular-nums"
        style={tint ? { color: tint } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

export default async function OrdersPage() {
  const [orders, tally] = await Promise.all([getAllOrders(), getProductTally()]);

  const toPay = orders.filter(
    (o) => o.status === "pending" || o.status === "half_paid",
  ).length;
  const revenue = orders
    .filter((o) => o.status === "paid" || o.status === "fulfilled")
    .reduce((n, o) => n + o.total_cents, 0);
  const unitsSold = tally.reduce((n, t) => n + t.totalQty, 0);

  return (
    <AdminWindow title="Orders" section="orders">
      <div className="flex flex-col gap-7">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Orders" value={String(orders.length)} />
          <Stat label="To pay" value={String(toPay)} tint={toPay > 0 ? "#c93400" : undefined} />
          <Stat label="Revenue (paid)" value={formatPrice(revenue)} />
          <Stat label="Units sold" value={String(unitsSold)} />
        </div>

        <OrdersTable orders={orders} />

        {tally.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="px-1 text-[13px] font-semibold">Units sold</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tally.map((t) => (
                <div key={t.title} className="mac-card px-4 py-3">
                  <div className="flex items-baseline gap-3">
                    <span className="min-w-0 flex-1 truncate font-medium">{t.title}</span>
                    <span className="font-semibold tabular-nums">{t.totalQty}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.variants.map((v) => (
                      <span
                        key={v.label}
                        className="inline-flex h-[20px] items-center gap-1 rounded-full bg-[var(--mac-fill)] px-2 text-[11px] text-[var(--mac-secondary)]"
                      >
                        <span className="font-medium text-[var(--mac-text)]">{v.label}</span>×{v.qty}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AdminWindow>
  );
}
