import { useState, type SubmitEvent } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { DateFormat, ServerUserPreferences } from "contracts/settings/user-preferences.schema";
import { SettingsLoadError } from "@/features/workspace/components/SettingsLoadError";
import { SettingsPageLoading } from "@/features/workspace/components/SettingsPageLoading";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeStore, type Theme } from "@/stores/use-theme-store";
import {
  useUpdateUserPreferences,
  useUserPreferences,
} from "@/features/workspace/hooks/use-user-preferences";
import { getSupportedTimeZones } from "@/features/workspace/lib/time-zones";

const TIME_ZONES = getSupportedTimeZones();

const DATE_FORMAT_LABELS: Record<DateFormat, string> = {
  DD_MM_YYYY: "DD/MM/YYYY",
  MM_DD_YYYY: "MM/DD/YYYY",
  YYYY_MM_DD: "YYYY/MM/DD",
};

const PreferencesForm = ({
  initialPreferences,
  canEdit,
}: {
  initialPreferences: ServerUserPreferences | null;
  canEdit: boolean;
}) => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const updatePreferences = useUpdateUserPreferences();
  const [timeZone, setTimeZone] = useState(initialPreferences?.timeZone ?? "");
  const [dateFormat, setDateFormat] = useState<ServerUserPreferences["dateFormat"] | "">(
    initialPreferences?.dateFormat ?? "",
  );

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canEdit || !timeZone || !dateFormat) {
      return;
    }

    updatePreferences.mutate(
      { timeZone, dateFormat },
      {
        onSuccess: () => {
          toast.success("Preferences saved successfully.");
        },
        onError: () => {
          toast.error("Unable to save preferences.");
        },
      },
    );
  };

  return (
    <form className="mt-8 max-w-2xl space-y-8" onSubmit={handleSubmit}>
      <section className="border-b border-border pb-6">
        <h2 className="font-medium text-foreground">Appearance</h2>

        <div className="mt-5">
          <label htmlFor="theme" className="text-sm font-medium text-foreground">
            Theme
          </label>

          <Select
            value={theme}
            onValueChange={(value) => {
              if (value !== null) {
                setTheme(value as Theme);
              }
            }}
          >
            <SelectTrigger id="theme" className="mt-2 h-11 w-full">
              <SelectValue placeholder="Select theme mode" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
            </SelectContent>
          </Select>

          <p className="mt-2 text-xs text-muted-foreground">
            Controls the appearance of the Causolve interface.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-medium text-foreground">Regional preferences</h2>

        <div className="mt-5">
          <label htmlFor="timeZone" className="text-sm font-medium text-foreground">
            Time zone
          </label>

          <Select
            value={timeZone || null}
            onValueChange={(value) => {
              if (value !== null) {
                setTimeZone(value);
              }
            }}
          >
            <SelectTrigger id="timeZone" className="mt-2 h-11 w-full">
              <SelectValue placeholder="Select your time zone" />
            </SelectTrigger>

            <SelectContent>
              {TIME_ZONES.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5">
          <label htmlFor="dateFormat" className="text-sm font-medium text-foreground">
            Date format
          </label>

          <Select
            value={dateFormat || null}
            disabled={!canEdit}
            onValueChange={(value) => {
              if (value !== null) {
                setDateFormat(value as DateFormat);
              }
            }}
          >
            <SelectTrigger id="dateFormat" className="mt-2 h-11 w-full">
              <SelectValue>{dateFormat ? DATE_FORMAT_LABELS[dateFormat] : undefined}</SelectValue>
            </SelectTrigger>

            <SelectContent>
              {Object.entries(DATE_FORMAT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <Button type="submit" variant="brand" disabled={!canEdit || updatePreferences.isPending}>
          {updatePreferences.isPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Check aria-hidden="true" />
          )}
          Save preferences
        </Button>
      </div>
    </form>
  );
};

export const PreferencesSettings = () => {
  const preferences = useUserPreferences();
  const hasPreferences = Boolean(preferences.data);
  const canEdit = hasPreferences && !preferences.isError;
  const showLoadError = preferences.isError && !preferences.isPending && !preferences.isFetching;

  if (preferences.isPending) {
    return (
      <SettingsPageLoading
        title="Preferences"
        description="Configure how Causolve behaves for your account."
      />
    );
  }

  return (
    <div>
      <header className="border-b border-border pb-6">
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Preferences</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Configure how Causolve behaves for your account.
        </p>
      </header>

      {showLoadError && (
        <SettingsLoadError
          message="Unable to load preferences."
          reason="We could not load your personal preferences."
          retrying={preferences.isFetching}
          onRetry={() => {
            void preferences.refetch();
          }}
        />
      )}

      <PreferencesForm
        key={`${preferences.data?.timeZone ?? ""}:${preferences.data?.dateFormat ?? ""}`}
        initialPreferences={preferences.data ?? null}
        canEdit={canEdit}
      />
    </div>
  );
};
