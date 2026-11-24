import { Loader2 } from "lucide-react";
import { RoleSchema } from "contracts/common/enums";

import { Input } from "@/components/ui/input";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { ProfileForms } from "@/features/workspace/components/ProfileForms";
import { SettingsLoadError } from "@/features/workspace/components/SettingsLoadError";

const WORKSPACE_ROLE_LABELS: Record<
  (typeof RoleSchema.options)[number],
  string
> = {
  OBSERVER: "Observer",
  ENGINEER: "Engineer",
  INCIDENT_COMMANDER: "Incident commander",
  ADMIN: "Administrator",
};

export const ProfileSettings = () => {
  const {
    data: session,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useAuthSession();

  if (isPending) {
    return (
      <div className="py-8">
        <Loader2
          className="size-4 animate-spin text-primary"
          aria-label="Loading profile"
        />
      </div>
    );
  }

  if (isError || !session?.authenticated) {
    return (
      <div>
        <header className="border-b border-border pb-6">
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            My profile
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage your personal account information.
          </p>
        </header>

        <SettingsLoadError
          message="Unable to load your profile"
          reason="We could not load your account information. Try again shortly."
          retrying={isFetching}
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  const { user, membership } = session;

  return (
    <div>
      <header className="border-b border-border pb-6">
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          My profile
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your personal account information.
        </p>
      </header>

      <section className="mt-8 space-y-6">
        <ProfileForms session={session} />

        <section className="border-b border-border pb-6">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email address
          </label>

          <Input
            id="email"
            value={user.email}
            readOnly
            disabled
            className="mt-2 opacity-60"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            Email address cannot be changed.
          </p>
        </section>

        <section>
          <p className="text-sm font-medium text-foreground">Workspace role</p>

          <div className="mt-2">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary-bright">
              {membership
                ? WORKSPACE_ROLE_LABELS[membership.role]
                : "No workspace role"}
            </span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Workspace roles are managed by organization administrators.
          </p>
        </section>
      </section>
    </div>
  );
};
