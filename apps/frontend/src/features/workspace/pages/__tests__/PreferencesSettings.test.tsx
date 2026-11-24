import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PreferencesSettings } from "@/features/workspace/pages/personal-settings/PreferencesSettings";
import { setAuthSession } from "@/mocks/utils";
import { authenticatedSettingsSession } from "./settings-test-session";

const renderPreferencesSettings = () => {
  setAuthSession(authenticatedSettingsSession);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <PreferencesSettings />
    </QueryClientProvider>,
  );
};

describe("PreferencesSettings", () => {
  it("renders the regional preferences with normalized date labels", async () => {
    localStorage.removeItem("causolve_mock_user_preferences");
    renderPreferencesSettings();

    expect(
      await screen.findByRole("heading", { name: "Preferences" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Africa/Lagos")).toBeInTheDocument();
    expect(await screen.findByText("DD/MM/YYYY")).toBeInTheDocument();
    expect(screen.queryByText("DD_MM_YYYY")).not.toBeInTheDocument();
  });
});
