export default function DiscoverLoading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading people near you…</span>
      <div className="mb-8 space-y-3">
        <div className="h-14 w-64 animate-pulse rounded-xl bg-mist" />
        <div className="h-14 w-48 animate-pulse rounded-xl bg-mist" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-mist" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="aspect-[4/5.6] animate-pulse rounded-3xl bg-mist" />
        ))}
      </div>
    </div>
  );
}
