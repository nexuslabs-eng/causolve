import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { SettingsLoadError } from "@/features/workspace/components/SettingsLoadError";
import { AiEvidenceSettingsForm } from "@/features/workspace/components/AiEvidenceSettingsForm";
import { SettingsPageLoading } from "@/features/workspace/components/SettingsPageLoading";
import {
  useAiEvidenceSettings,
  useUpdateAiEvidenceSettings,
} from "@/features/workspace/hooks/use-ai-evidence-settings";

export const AiEvidenceSettings = () => {
  const { data: session } = useAuthSession();

  const organizationId = session?.authenticated
    ? (session.activeWorkspace?.organizationId ?? "")
    : "";

  const settingsQuery = useAiEvidenceSettings(organizationId);
  const updateMutation = useUpdateAiEvidenceSettings();

  const settings = settingsQuery.data ?? null;
  const canEdit = Boolean(settings) && !settingsQuery.isPending && !settingsQuery.isError;
  const showLoadError =
    settingsQuery.isError && !settingsQuery.isPending && !settingsQuery.isFetching;

  if (settingsQuery.isPending) {
    return (
      <SettingsPageLoading
        title="AI & evidence policies"
        description="Configure how AI assistance and evidence are handled."
      />
    );
  }

  return (
    <div className="min-w-0">
      {showLoadError && (
        <SettingsLoadError
          message="AI and evidence policies could not be loaded."
          reason="The policy service is unavailable."
          retrying={settingsQuery.isFetching}
          onRetry={() => void settingsQuery.refetch()}
        />
      )}

      <AiEvidenceSettingsForm
        settings={settings}
        canEdit={canEdit}
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
