import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center" aria-busy="true">
      <Spinner className="size-7" label="Loading" />
    </div>
  );
}
