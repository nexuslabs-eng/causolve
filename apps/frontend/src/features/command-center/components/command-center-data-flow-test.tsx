import { useParams } from "react-router-dom";
import { useCommandCenter } from "../hooks/use-command-center";

export const CommandCenterDataFlowTest = () => {
  const { incidentId } = useParams<{ incidentId: string }>();

  if (!incidentId) {
    return (
      <main className="p-8">
        <p className="text-red-600">No incident ID was provided.</p>
      </main>
    );
  }

  return <CommandCenterResult incidentId={incidentId} />;
};

const CommandCenterResult = ({ incidentId }: { incidentId: string }) => {
  const { data, error, isPending, isError, isFetching } = useCommandCenter(incidentId);

  if (isPending) {
    return (
      <main className="p-8">
        <p>Loading mocked Command Center data...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-semibold text-red-700">Command Center request failed</h1>

        <pre className="mt-4 overflow-auto bg-red-50 p-4 text-sm text-red-900">{error.message}</pre>
      </main>
    );
  }

  const leadingHypothesis = data.hypotheses.find(
    (hypothesis) => hypothesis.id === data.investigation?.leadingHypothesisId,
  );

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="border-b pb-5">
        <p className="text-sm text-muted-foreground">Contract-validated Command Center response</p>

        <h1 className="mt-1 text-2xl font-semibold">{data.incident.title}</h1>

        {isFetching && <p className="mt-2 text-sm text-muted-foreground">Refreshing</p>}
      </header>

      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <DataField label="Incident ID" value={data.incident.id} />
        <DataField label="Severity" value={data.incident.severity} />
        <DataField label="Incident status" value={data.incident.status} />
        <DataField
          label="Investigation status"
          value={data.investigation?.status ?? "Not started"}
        />
        <DataField label="Integrity" value={data.integrity?.level ?? "Unavailable"} />
        <DataField
          label="Evidence coverage"
          value={data.integrity ? `${data.integrity.evidenceCoverage}%` : "Unavailable"}
        />
        <DataField label="Leading hypothesis" value={leadingHypothesis?.statement ?? "None"} />
        <DataField label="Recommendation" value={data.recommendation?.summary ?? "None"} />
      </dl>
    </main>
  );
};

const DataField = ({ label, value }: { label: string; value: string }) => {
  return (
    <div>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 wrap-break-word">{value}</dd>
    </div>
  );
};
