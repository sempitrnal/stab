import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { signOut } from "./actions";
import ActiveToggle from "@/components/admin/active-toggle";

export const metadata = { title: "STAB · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const products = await getAllProducts();

  return (
    <div className="px-4 py-6 flex flex-col gap-10">
      <div className="flex items-center justify-between border-b border-ink/15 pb-3">
        <h1 className="font-black uppercase tracking-tight text-2xl">Admin</h1>
        <div className="flex items-center gap-6">
          <span className="font-mono text-[11px] uppercase tracking-widest underline underline-offset-4">
            Products
          </span>
          <Link
            href="/admin/orders"
            className="font-mono text-[11px] uppercase tracking-widest text-faded hover:text-accent"
          >
            Orders
          </Link>
          <Link
            href="/admin/products/new"
            className="font-mono text-[11px] uppercase tracking-widest hover:text-accent"
          >
            + New product
          </Link>
          <form action={signOut}>
            <button className="font-mono text-[11px] uppercase tracking-widest text-faded hover:text-accent">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-faded mb-2">
          Products · {products.length}
        </h2>
        <ul className="border-t border-ink/15">
          {products.map((p) => {
            const totalStock = (p.variants ?? []).reduce(
              (n, v) => n + v.stock,
              0,
            );
            const image = p.images?.[0] ?? null;
            return (
              <li
                key={p.id}
                className="border-b border-ink/15 py-2 flex items-center gap-4"
              >
                <div
                  className={`relative w-10 h-12 bg-bone shrink-0 overflow-hidden flex items-center justify-center ${p.active ? "" : "opacity-40 grayscale"}`}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={p.title}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-mono text-[8px] uppercase tracking-widest text-ink/40 px-1 text-center leading-tight">
                      {p.title}
                    </span>
                  )}
                </div>
                <Link
                  href={`/admin/products/${p.id}`}
                  className="font-bold uppercase text-sm tracking-tight hover:text-accent transition-colors min-w-0 truncate"
                >
                  {p.title}
                </Link>
                {!p.active && (
                  <span className="font-mono text-[9px] uppercase tracking-widest text-accent shrink-0">
                    Hidden
                  </span>
                )}
                <span className="font-mono text-[10px] uppercase tracking-widest text-faded hidden sm:inline">
                  {p.type}
                </span>
                <span className="flex-1" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-faded">
                  <span className="sm:hidden">{totalStock}</span>
                  <span className="hidden sm:inline">
                    {totalStock} in stock · {(p.variants ?? []).length} var
                  </span>
                </span>
                <span className="font-mono text-xs w-16 text-right shrink-0">
                  {formatPrice(p.price_cents)}
                </span>
                <ActiveToggle id={p.id} active={p.active} />
              </li>
            );
          })}
          {products.length === 0 && (
            <li className="py-8 text-center font-mono text-xs uppercase tracking-widest text-faded">
              No products yet, add one
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
