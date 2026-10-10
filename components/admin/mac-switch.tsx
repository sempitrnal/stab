"use client";

// macOS-style on/off switch.
export default function MacSwitch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  /** Accessible name when there's no visible label next to it. */
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${
        checked ? "bg-[var(--mac-accent)]" : "bg-[rgb(0_0_0/0.14)]"
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.2),0_0_0_0.5px_rgb(0_0_0/0.04)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
