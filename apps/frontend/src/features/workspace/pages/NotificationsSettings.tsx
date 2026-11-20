import { Loader2 } from "lucide-react";

import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/features/workspace/hooks/use-notification-preferences";

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

  const handleChange = (key: PreferenceKey, checked: boolean) => {
    updatePreferences.mutate({
      [key]: checked,
    });
  };

  return (
    <div>
      <header className="pb-6">
        <p className="font-mono text-[10px] uppercase text-primary-bright">
          Personal settings
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Notifications
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Configure how Causolve delivers personal notifications.
        </p>
      </header>

      {preferences.isPending && (
        <div className="mt-8 flex min-h-48 items-center justify-center">
          <Loader2
            className="size-5 animate-spin text-primary"
            aria-label="Loading notification settings"
          />
        </div>
      )}

      {preferences.isError && (
        <p className="mt-8 text-sm text-destructive" role="alert">
          Unable to load your notification settings.
        </p>
      )}

      {preferences.data && (
        <section className="mt-8 divide-y divide-border border-y border-border">
          {preferenceItems.map((item) => {
            const checked = preferences.data[item.key];

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
                  disabled={updatePreferences.isPending}
                  onChange={(event) =>
                    handleChange(item.key, event.target.checked)
                  }
                  className="mt-1 size-4 shrink-0 accent-primary"
                />
              </label>
            );
          })}
        </section>
      )}

      {updatePreferences.isPending && (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          Saving notification preferences...
        </p>
      )}

      {updatePreferences.isError && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          Unable to save your notification preferences.
        </p>
      )}

      {updatePreferences.isSuccess && (
        <p className="mt-4 text-sm text-emerald-500" role="status">
          Notification preferences saved.
        </p>
      )}
    </div>
  );
};
