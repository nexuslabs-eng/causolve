import { Loader2 } from "lucide-react";

type SettingsPageLoadingProps = {
  title: string;
  description: string;
};

export const SettingsPageLoading = ({ title, description }: SettingsPageLoadingProps) => (
  <div className="min-w-0">
    <header className="border-b border-border pb-6">
      <h1 className="mt-2 text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </header>

    <div
      className="flex min-h-48 items-center justify-center"
      role="status"
      aria-label={`Loading ${title.toLowerCase()}`}
    >
      <Loader2 className="size-5 animate-spin text-primary" />
    </div>
  </div>
);
