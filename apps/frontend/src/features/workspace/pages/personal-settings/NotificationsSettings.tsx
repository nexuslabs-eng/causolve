import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/features/workspace/hooks/use-notification-preferences";
import { SettingsLoadError } from "@/features/workspace/components/SettingsLoadError";
import { SettingsPageLoading } from "@/features/workspace/components/SettingsPageLoading";
import { toast } from "sonner";

type PreferenceKey =
  | "emailNotifications"
  | "incidentAlerts"
  | "investigationUpdates"
  | "workspaceInvitations";

const preferenceItems: Array<{
  key: PreferenceKey;
  title: string;
  description: string;
}> = [
  {
    key: "emailNotifications",
    title: "Email notifications",
    description: "Receive important account and workspace updates by email.",
  },
  {
    key: "incidentAlerts",
    title: "Incident alerts",
    description: "Receive notifications when incidents require your attention.",
  },
  {
    key: "investigationUpdates",
    title: "Investigation updates",
    description: "Receive updates about investigations you are involved in.",
  },
  {
    key: "workspaceInvitations",
    title: "Workspace invitations",
    description: "Receive notifications when you are invited to a workspace.",
  },
];

export const NotificationsSettings = () => {
  const preferences = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const hasPreferences = Boolean(preferences.data);
  const canEdit = hasPreferences && !preferences.isError;
  const showLoadError =
    preferences.isError &&
    !preferences.isPending &&
    !preferences.isFetching;

  if (preferences.isPending) {
    return (
      <SettingsPageLoading
        title="Notifications"
        description="Configure how Causolve delivers personal notifications."
      />
    );
  }

  const handleChange = (key: PreferenceKey, checked: boolean) => {
    updatePreferences.mutate(
      {
        [key]: checked,
      },
      {
        onSuccess: () => {
          toast.success("Notification preferences saved.");
        },
        onError: () => {
          toast.error("Unable to save your notification preferences.");
        },
      },
    );
  };

  return (
    <div>
      <header className="pb-6">
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Notifications
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Configure how Causolve delivers personal notifications.
        </p>
      </header>

      {showLoadError && (
        <SettingsLoadError
          message="Unable to load notification settings."
          reason="We could not load your notification preferences."
          retrying={preferences.isFetching}
          onRetry={() => {
            void preferences.refetch();
          }}
        />
      )}

      <section className="mt-8 divide-y divide-border border-y border-border">
          {preferenceItems.map((item) => {
            const checked = preferences.data?.[item.key] ?? false;

            return (
              <label
                key={item.key}
                className="flex cursor-pointer items-start justify-between gap-6 py-5"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {item.title}
                  </span>

                  <span className="mt-1 block text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </span>

                <input
                  type="checkbox"
                  aria-label={item.title}
                  checked={checked}
                disabled={!canEdit || updatePreferences.isPending}
                  onChange={(event) =>
                    handleChange(item.key, event.target.checked)
                  }
                  className="mt-1 size-4 shrink-0 accent-primary"
                />
              </label>
            );
          })}
      </section>

      {updatePreferences.isPending && (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          Saving notification preferences...
        </p>
      )}

    </div>
  );
};
