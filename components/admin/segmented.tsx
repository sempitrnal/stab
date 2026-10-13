"use client";

import Link, { useLinkStatus } from "next/link";

type Option<T extends string> = { value: T; label: string; href?: string };

// Swaps the label for a spinner while its link's navigation is pending. The
// label stays in place (invisible) so the control doesn't change width.
function PendingLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <span className="relative">
      <span className={pending ? "invisible" : undefined}>{children}</span>
      {pending && (
        <span
          className="absolute inset-0 grid place-items-center"
          role="status"
          aria-label="Loading"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5 animate-spin"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="8" cy="8" r="6" opacity="0.25" />
            <path d="M14 8a6 6 0 0 0-6-6" />
          </svg>
        </span>
      )}
    </span>
  );
}

// macOS segmented control. Options with an href render as links (for nav);
// the rest call onChange.
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  scroll = true,
  prefetch,
  showPending,
}: {
  options: Option<T>[];
  value: T;
  onChange?: (value: T) => void;
  size?: "sm" | "md";
  /** For link options: false keeps the scroll position on navigation. */
  scroll?: boolean;
  /** For link options: true prefetches the whole page, data included, as the link scrolls into view. */
  prefetch?: boolean;
  /** For link options: show a spinner on the link while its page loads. */
  showPending?: boolean;
}) {
  const h =
    size === "sm" ? "h-[24px] text-[0.75rem]" : "h-[28px] text-[0.8125rem]";
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
          <Link
            key={o.value}
            href={o.href}
            scroll={scroll}
            prefetch={prefetch}
            className={cls}
            aria-current={on ? "page" : undefined}
          >
            {showPending ? <PendingLabel>{o.label}</PendingLabel> : o.label}
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
