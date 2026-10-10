"use client";

// macOS-style checkbox. `mixed` shows the dash used for a partial
// select-all.
export default function MacCheckbox({
  checked,
  mixed,
  onToggle,
  label,
}: {
  checked: boolean;
  mixed?: boolean;
  onToggle: (shiftKey: boolean) => void;
  label: string;
}) {
  const on = checked || mixed;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={mixed ? "mixed" : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(e.shiftKey);
      }}
      className={`flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[4px] transition-colors ${
        on
          ? "bg-[var(--mac-accent)] shadow-[inset_0_0.5px_0_rgb(255_255_255/0.25)]"
          : "bg-white shadow-[inset_0_0_0_1px_rgb(0_0_0/0.22),0_0.5px_1px_rgb(0_0_0/0.06)]"
      }`}
    >
      {mixed ? (
        <span className="h-[1.5px] w-[7px] rounded-full bg-white" />
      ) : checked ? (
        <svg viewBox="0 0 12 12" className="h-[10px] w-[10px]" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2.5 6.2 2.3 2.3 4.7-5" />
        </svg>
      ) : null}
    </button>
  );
}
