// Shown instantly while an admin page fetches its data, so navigation gives
// feedback right away instead of freezing on the old page.
export default function AdminLoading() {
  return (
    <div className="mac my-6 overflow-clip rounded-[14px] bg-[var(--mac-bg)] shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_12px_40px_rgb(0_0_0/0.10)]">
      <div className="flex items-center gap-4 border-b border-[var(--mac-sep)] bg-[rgb(246_246_248/0.8)] px-4 py-2.5">
        <div className="flex items-center gap-2" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="h-3 w-24 animate-pulse rounded bg-black/10" />
      </div>
      <div
        className="flex flex-col gap-3 p-4 md:p-6"
        aria-busy="true"
        aria-label="Loading"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-lg bg-black/[0.06]"
          />
        ))}
      </div>
    </div>
  );
}
