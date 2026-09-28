export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10" aria-busy="true">
      <span className="sr-only">Loading your profile…</span>
      <div className="flex items-center gap-5">
        <div className="size-32 animate-pulse rounded-full bg-mist" />
        <div className="h-10 w-56 animate-pulse rounded-xl bg-mist" />
      </div>
      <div className="mt-8 space-y-5">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-mist" />
        ))}
      </div>
    </div>
  );
}
