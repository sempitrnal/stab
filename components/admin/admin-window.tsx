import Link from "next/link";
import Segmented from "@/components/admin/segmented";
import { signOut } from "@/app/admin/(panel)/actions";

// macOS-style window around admin pages: traffic lights, frosted toolbar with
// the section switcher, then the page body on a soft grey canvas.
export default function AdminWindow({
  title,
  section,
  actions,
  children,
}: {
  title: string;
  section: "products" | "orders";
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mac my-6 overflow-clip rounded-[14px] bg-[var(--mac-bg)] shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_12px_40px_rgb(0_0_0/0.10)]">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--mac-sep)] bg-[rgb(246_246_248/0.8)] px-4 py-2.5 backdrop-blur-xl backdrop-saturate-150">
        <div className="flex items-center gap-2" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.12)]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.12)]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.12)]" />
        </div>
        <h1 className="min-w-0 flex-1 truncate text-[13px] font-semibold">
          {title}
        </h1>
        <Segmented
          size="sm"
          value={section}
          options={[
            { value: "products", label: "Products", href: "/admin" },
            { value: "orders", label: "Orders", href: "/admin/orders" },
          ]}
        />
        <div className="flex items-center gap-2">
          {actions}
          <form action={signOut}>
            <button className="mac-btn">Sign out</button>
          </form>
        </div>
      </header>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}

export function NewProductButton() {
  return (
    <Link href="/admin/products/new" className="mac-btn" data-variant="primary">
      <span className="text-[15px] leading-none">+</span> New product
    </Link>
  );
}
