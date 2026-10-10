"use client";

import Link from "next/link";

type Option<T extends string> = { value: T; label: string; href?: string };

// macOS segmented control. Options with an href render as links (for nav);
// the rest call onChange.
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  scroll = true,
}: {
  options: Option<T>[];
  value: T;
  onChange?: (value: T) => void;
  size?: "sm" | "md";
  /** For link options: false keeps the scroll position on navigation. */
  scroll?: boolean;
}) {
  const h = size === "sm" ? "h-[24px] text-[12px]" : "h-[28px] text-[13px]";
  return (
    <div className="inline-flex rounded-[8px] bg-[var(--mac-fill)] p-[2px]">
      {options.map((o) => {
        const on = o.value === value;
        const cls = `${h} px-3 inline-flex items-center rounded-[6px] font-medium transition-[background-color,box-shadow,color] duration-150 ${
          on
            ? "bg-white text-[var(--mac-text)] shadow-[0_1px_2px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.06)]"
            : "text-[var(--mac-secondary)] hover:text-[var(--mac-text)]"
        }`;
        return o.href ? (
          <Link key={o.value} href={o.href} scroll={scroll} className={cls} aria-current={on ? "page" : undefined}>
            {o.label}
          </Link>
        ) : (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange?.(o.value)}
            className={cls}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
