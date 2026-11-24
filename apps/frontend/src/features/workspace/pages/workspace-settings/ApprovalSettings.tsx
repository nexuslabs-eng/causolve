import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { SettingsLoadError } from "@/features/workspace/components/SettingsLoadError";
import { ApprovalSettingsForm } from "@/features/workspace/components/ApprovalSettingsForm";
import { SettingsPageLoading } from "@/features/workspace/components/SettingsPageLoading";
import {
  useApprovalSettings,
  useUpdateApprovalSettings,
} from "@/features/workspace/hooks/use-approval-settings";

export const ApprovalSettings = () => {
  const { data: session } = useAuthSession();

  const organizationId = session?.authenticated
    ? (session.activeWorkspace?.organizationId ?? "")
    : "";

  const settingsQuery = useApprovalSettings(organizationId);
  const updateMutation = useUpdateApprovalSettings();
  const settings = settingsQuery.data ?? null;

  const canEdit = Boolean(settings) && !settingsQuery.isPending && !settingsQuery.isError;

  const showLoadError =
    settingsQuery.isError && !settingsQuery.isPending && !settingsQuery.isFetching;

  if (settingsQuery.isPending) {
    return (
      <SettingsPageLoading
        title="Approvals & remediation"
        description="Configure authorization requirements for high-impact actions."
      />
    );
  }

  return (
    <div className="min-w-0">
      {showLoadError && (
        <SettingsLoadError
          message="Approval settings could not be loaded."
          reason="The approval policy service is unavailable."
          retrying={settingsQuery.isFetching}
          onRetry={() => void settingsQuery.refetch()}
        />
      )}

      <ApprovalSettingsForm
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
