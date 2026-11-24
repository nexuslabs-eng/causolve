import { IntegrationCard } from "@/features/workspace/components/IntegrationCard";
import { INTEGRATION_DEFINITIONS } from "@/features/workspace/lib/integrations";

export const IntegrationsSettings = () => {
  return (
    <div className="@container/integrations min-w-0">
      <header className="border-b border-border pb-5">
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Integrations
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Connect the tools your workspace uses for incident response and
          investigation work.
        </p>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-2.5 @[620px]/integrations:grid-cols-2">
        {INTEGRATION_DEFINITIONS.map((definition) => (
          <IntegrationCard key={definition.provider} definition={definition} />
        ))}
      </section>
    </div>
  );
};
