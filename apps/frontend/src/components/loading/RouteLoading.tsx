import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const RouteLoading = ({ className }: { className?: string }) => (
  <div role="status" className={cn("grid min-h-40 place-items-center", className)}>
    <LoaderCircle
      aria-hidden="true"
      className="size-6 animate-spin text-primary motion-reduce:animate-none"
    />
    <span className="sr-only">Loading page</span>
  </div>
);
