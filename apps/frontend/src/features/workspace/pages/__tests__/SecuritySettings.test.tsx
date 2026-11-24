import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { SecuritySettings } from "@/features/workspace/pages/personal-settings/SecuritySettings";
import { authSessionQueryKey } from "@/features/auth/queries/auth-session-query-options";
import { setAuthSession } from "@/mocks/utils";
import { authenticatedSettingsSession } from "./settings-test-session";

const renderSecuritySettings = () => {
  setAuthSession(authenticatedSettingsSession);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  queryClient.setQueryData(authSessionQueryKey, authenticatedSettingsSession);

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SecuritySettings />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("SecuritySettings", () => {
  it("renders account verification and password security controls", () => {
    renderSecuritySettings();

    expect(
      screen.getByRole("heading", { name: "Account & security" }),
    ).toBeInTheDocument();
    expect(screen.getByText("samuel@example.com")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByLabelText("Current password")).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
  });

  it("shows contract validation errors for an empty password form", async () => {
    const user = userEvent.setup();

    renderSecuritySettings();

    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(
      await screen.findByText("Current password is required."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Password must contain at least 10 characters."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Confirm your new password."),
    ).toBeInTheDocument();
  });

  it("shows the shared mismatch error for different passwords", async () => {
    const user = userEvent.setup();

    renderSecuritySettings();

    await user.type(
      screen.getByLabelText("Current password"),
      "CurrentPassword123!",
    );
    await user.type(screen.getByLabelText("New password"), "NewPassword123!");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "DifferentPassword123!",
    );
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
  });
});
