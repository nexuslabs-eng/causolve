import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { GeneralSettingsForm } from "@/features/workspace/components/GeneralSettingsForm";
import { SettingsLoadError } from "@/features/workspace/components/SettingsLoadError";
import { SettingsPageLoading } from "@/features/workspace/components/SettingsPageLoading";

export const GeneralSettings = () => {
  const sessionQuery = useAuthSession();

  const workspace = sessionQuery.data?.authenticated
    ? sessionQuery.data.activeWorkspace
    : null;

  const sessionError =
    sessionQuery.error instanceof Error
      ? sessionQuery.error.message
      : undefined;

  const showSessionError =
    Boolean(sessionError) &&
    !sessionQuery.isPending &&
    !sessionQuery.isFetching;

  if (sessionQuery.isPending) {
    return (
      <SettingsPageLoading
        title="General"
        description="Manage the basic configuration for this workspace."
      />
    );
  }

  return (
    <div className="min-w-0">
      {showSessionError && sessionError && (
        <SettingsLoadError
          message="Workspace settings could not be loaded."
          reason={sessionError}
          retrying={sessionQuery.isFetching}
          onRetry={() => void sessionQuery.refetch()}
        />
      )}

      <GeneralSettingsForm
        settings={workspace}
        canEdit={Boolean(workspace) && !sessionError}
      />
    </div>
  );
};
