export default function PersonLoading() {
  return (
    <div className="mx-auto max-w-5xl md:px-8 md:py-10" aria-busy="true">
      <span className="sr-only">Loading profile…</span>
      <div className="md:grid md:grid-cols-[5fr_6fr] md:gap-10">
        <div className="aspect-[4/5] w-full animate-pulse bg-mist md:rounded-3xl" />
        <div className="space-y-5 px-5 pt-6 md:px-0">
          <div className="h-6 w-28 animate-pulse rounded-full bg-mist" />
          <div className="h-20 animate-pulse rounded-xl bg-mist" />
          <div className="h-10 w-3/4 animate-pulse rounded-xl bg-mist" />
          <div className="h-24 animate-pulse rounded-2xl bg-mist" />
        </div>
      </div>
    </div>
  );
}
