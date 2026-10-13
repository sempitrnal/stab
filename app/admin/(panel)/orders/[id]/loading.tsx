// Shown instantly while an order's details load.
export default function OrderLoading() {
  return (
    <div
      className="px-4 py-6 flex flex-col gap-6"
      role="status"
      aria-label="Loading order"
    >
      <div className="flex items-center gap-3 border-b border-ink/15 pb-3">
        <span className="size-4 rounded-full border-2 border-ink/20 border-t-ink motion-safe:animate-spin" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-faded">
          Loading order…
        </span>
      </div>
      <div className="flex flex-col gap-3 motion-safe:animate-pulse">
        <div className="h-8 w-40 bg-ink/10" />
        <div className="h-4 w-64 bg-ink/10" />
        <div className="h-4 w-52 bg-ink/10" />
        <div className="mt-4 h-32 w-full bg-ink/10" />
      </div>
    </div>
  );
}
