import { FaGithub as Github, FaGoogle as Google } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export type SetIsProviderLoading = Dispatch<SetStateAction<{ google: boolean; github: boolean }>>;

export interface ProviderHandle {
  google: () => Promise<void>;
  github: () => Promise<void>;
}

interface ProviderLoading {
  google: boolean;
  github: boolean;
}

interface SocialAuthButtonsProps {
  mode: "login" | "signup";
  loadingLabel?: string;
  isProviderLoading: ProviderLoading;
  providerHandle: ProviderHandle;
}

export const SocialAuthButtons = ({
  mode,
  loadingLabel = "please wait...",
  isProviderLoading,
  providerHandle,
}: SocialAuthButtonsProps) => {
  const action = mode === "login" ? "Continue" : "Sign up";

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="subtle"
          size="lg"
          disabled={isProviderLoading.google || isProviderLoading.github}
          className="h-11"
          onClick={() => providerHandle.google()}
        >
          {isProviderLoading.google ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              {loadingLabel}
            </>
          ) : (
            <>
              <Google aria-hidden="true" />
              {action} with Google
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="subtle"
          size="lg"
          className="h-11"
          onClick={() => providerHandle.github()}
          disabled={isProviderLoading.github || isProviderLoading.google}
        >
          {isProviderLoading.github ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              {loadingLabel}
            </>
          ) : (
            <>
              <Github aria-hidden="true" />
              {action} with GitHub
            </>
          )}
        </Button>
      </div>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />

        <span className="text-xs text-muted-foreground">or continue with email</span>

        <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
};
