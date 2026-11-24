import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { IntegrationDefinition } from "@/features/workspace/lib/integrations";
import { cn } from "@/lib/utils";

type IntegrationCardProps = {
  definition: IntegrationDefinition;
};

export const IntegrationCard = ({
  definition,
}: IntegrationCardProps) => {
  const Icon = definition.icon;

  return (
    <article className="rounded-md border border-border bg-surface-raised px-3 py-2.5 transition-colors hover:border-border-strong">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-surface-inset">
          <Icon
            aria-hidden="true"
            className={cn("size-5", definition.iconClassName)}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-medium text-foreground">
            {definition.name}
          </h2>

          <span className="mt-1 inline-flex rounded-full border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
            Not connected
          </span>
        </div>

        <Button
          type="button"
          size="sm"
          variant="subtle"
          disabled
          aria-label={`Connect ${definition.name}`}
        >
          <Link2 />
          Connect
        </Button>
      </div>
    </article>
  );
};
