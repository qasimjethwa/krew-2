export default function MatchLoading() {
  return (
    <div className="sm:px-8 sm:py-10" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="mx-auto h-[36rem] max-w-xl animate-pulse bg-ink-2 sm:rounded-[2rem]" />
    </div>
  );
}
