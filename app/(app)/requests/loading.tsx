export default function ListLoading() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="h-11 w-72 max-w-full animate-pulse rounded-xl bg-mist" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-mist" />
        ))}
      </div>
    </div>
  );
}
