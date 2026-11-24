import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { AuditSettingsForm } from "@/features/workspace/components/AuditSettingsForm";
import { SettingsLoadError } from "@/features/workspace/components/SettingsLoadError";
import { SettingsPageLoading } from "@/features/workspace/components/SettingsPageLoading";
import {
  useAuditSettings,
  useUpdateAuditSettings,
} from "@/features/workspace/hooks/use-audit-settings";

export const AuditSettings = () => {
  const { data: session } = useAuthSession();

  const organizationId = session?.authenticated
    ? (session.activeWorkspace?.organizationId ?? "")
    : "";

  const settingsQuery = useAuditSettings(organizationId);
  const updateMutation = useUpdateAuditSettings();
  const settings = settingsQuery.data ?? null;

  if (settingsQuery.isPending) {
    return (
      <SettingsPageLoading
        title="Audit & activity"
        description="Configure audit retention, access, event coverage, and archival."
      />
    );
  }

  const showLoadError =
    settingsQuery.isError && !settingsQuery.isPending && !settingsQuery.isFetching;

  return (
    <div className="min-w-0">
      {showLoadError && (
        <SettingsLoadError
          message="Audit settings could not be loaded."
          reason="The audit settings service is unavailable."
          retrying={settingsQuery.isFetching}
          onRetry={() => void settingsQuery.refetch()}
        />
      )}

      <AuditSettingsForm
        settings={settings}
        canEdit={Boolean(settings) && !settingsQuery.isError}
        onSave={async (values) => {
          await updateMutation.mutateAsync({
            organizationId,
            input: values,
          });
        }}
      />
    </div>
  );
};
