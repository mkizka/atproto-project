import { LoaderCircle } from "lucide-react";

export function HydrateFallback() {
  return (
    <div className="flex h-screen w-full justify-center pt-32">
      <LoaderCircle className="size-14 animate-spin stroke-current text-muted-foreground" />
    </div>
  );
}
