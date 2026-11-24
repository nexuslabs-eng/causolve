import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { SettingsLoadError } from "@/features/workspace/components/SettingsLoadError";
import { InvestigationSettingsForm } from "@/features/workspace/components/InvestigationSettingsForm";
import { SettingsPageLoading } from "@/features/workspace/components/SettingsPageLoading";
import {
  useInvestigationSettings,
  useUpdateInvestigationSettings,
} from "@/features/workspace/hooks/use-investigation-settings";

export const InvestigationSettings = () => {
  const { data: session } = useAuthSession();

  const organizationId = session?.authenticated
    ? (session.activeWorkspace?.organizationId ?? "")
    : "";

  const query = useInvestigationSettings(organizationId);
  const update = useUpdateInvestigationSettings();

  const settings = query.data ?? null;
  const canEdit = Boolean(settings) && !query.isError && !query.isPending;
  const showLoadError =
    query.isError && !query.isPending && !query.isFetching;

  if (query.isPending) {
    return (
      <SettingsPageLoading
        title="Investigation configuration"
        description="Configure how investigations collect and evaluate evidence."
      />
    );
  }

  return (
    <div className="min-w-0">
      {showLoadError && (
        <SettingsLoadError
          message="Investigation settings could not be loaded."
          reason="The investigation configuration service is unavailable."
          retrying={query.isFetching}
          onRetry={() => void query.refetch()}
        />
      )}

      <InvestigationSettingsForm
        settings={settings}
        canEdit={canEdit}
        onSave={async (values) => {
          await update.mutateAsync({
            organizationId,
            input: values,
          });
        }}
      />
    </div>
  );
};
