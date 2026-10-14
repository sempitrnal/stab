"use client";

import { useEffect, useId, useRef, useState } from "react";

export type DropdownOption<T extends string> = {
  value: T;
  label: string;
  // Pastel fill for the dot / tinted trigger, and the text color on it.
  color?: string;
  ink?: string;
};

// macOS-style pop-up menu with optional per-option color dots. Keyboard:
// arrows move, Enter/Space picks, Escape closes.
export default function Dropdown<T extends string>({
  value,
  options,
  onChange,
  label,
  disabled,
  tinted,
}: {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  label: string;
  disabled?: boolean;
  // Fill the trigger with the selected option's pastel color.
  tinted?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  function show() {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function pick(i: number) {
    setOpen(false);
    if (options[i].value !== value) onChange(options[i].value);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return show();
      const d = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + d + options.length) % options.length);
    } else if ((e.key === "Enter" || e.key === " ") && open) {
      e.preventDefault();
      pick(active);
    }
  }

  return (
    <div ref={root} className="relative inline-block" onKeyDown={onKeyDown}>
      <button
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        className="mac-input inline-flex w-auto! items-center gap-2 pr-2.5! text-left font-medium disabled:opacity-60"
        style={
          tinted && current.color
            ? {
                color: current.ink,
                backgroundColor: `color-mix(in srgb, ${current.color} 55%, white)`,
                borderColor: "transparent",
              }
            : undefined
        }
      >
        {current.color && (
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: current.ink ?? current.color }}
          />
        )}
        <span className="whitespace-nowrap">{current.label}</span>
        <svg
          aria-hidden
          viewBox="0 0 10 14"
          className="ml-1 h-3 w-2 shrink-0 text-[var(--mac-secondary)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m2 5 3-3 3 3M2 9l3 3 3-3" />
        </svg>
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full z-30 mt-1 min-w-full rounded-[10px] bg-white/90 p-1 shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_8px_24px_rgb(0_0_0/0.14)] backdrop-blur-xl backdrop-saturate-150"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
              className={`flex cursor-default items-center gap-2 whitespace-nowrap rounded-[6px] py-1 pl-2 pr-3 ${
                i === active ? "bg-[var(--mac-accent)] text-white" : ""
              }`}
              style={i !== active && o.ink ? { color: o.ink } : undefined}
            >
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: o.color ?? "transparent",
                  boxShadow: o.color
                    ? i === active
                      ? "0 0 0 1.5px white"
                      : `inset 0 0 0 1px ${o.ink ?? o.color}`
                    : undefined,
                }}
              />
              <span className="flex-1">{o.label}</span>
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                className={`h-3 w-3 ${o.value === value ? "" : "invisible"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m2.5 6.5 2.5 2.5 4.5-6" />
              </svg>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
