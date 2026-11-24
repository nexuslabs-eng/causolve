import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "contracts/auth/auth-session.schema";

const { toastSuccess } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccess,
    error: vi.fn(),
  },
}));

import { ProfileSettings } from "@/features/workspace/pages/personal-settings/ProfileSettings";
import { authSessionQueryKey } from "@/features/auth/queries/auth-session-query-options";
import { setAuthSession } from "@/mocks/utils";

const authenticatedSession: AuthSession = {
  authenticated: true,
  user: {
    id: "11111111-1111-4111-8111-111111111111",
    fullName: "Samuel Oso",
    email: "samuel@example.com",
    emailVerified: true,
  },
  activeWorkspace: {
    organizationId: "22222222-2222-4222-8222-222222222222",
    name: "Causolve",
    slug: "causolve",
    teamSize: "SIX_TO_TWENTY",
  },
  membership: {
    role: "ADMIN",
    jobRole: "FRONTEND_ENGINEER",
  },
  onboarding: {
    status: "COMPLETED",
    nextStep: "COMPLETE",
    emailVerified: true,
    workspaceCreated: true,
    profileCompleted: true,
    completedAt: "2026-11-18T00:00:00.000Z",
  },
};

const renderProfileSettings = () => {
  setAuthSession(authenticatedSession);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  queryClient.setQueryData(authSessionQueryKey, authenticatedSession);

  return render(
    <QueryClientProvider client={queryClient}>
      <ProfileSettings />
    </QueryClientProvider>,
  );
};

describe("ProfileSettings", () => {
  beforeEach(() => {
    toastSuccess.mockClear();
  });

  it("renders the authenticated user's profile details", async () => {
    renderProfileSettings();

    expect(
      await screen.findByRole("heading", {
        name: "My profile",
      }),
    ).toBeInTheDocument();

    expect(await screen.findByDisplayValue("Samuel Oso")).toBeInTheDocument();

    const emailInput = await screen.findByDisplayValue("samuel@example.com");

    expect(emailInput).toBeDisabled();
  });

  it("updates the full name through the profile request", async () => {
    const user = userEvent.setup();

    renderProfileSettings();

    const fullNameInput = await screen.findByLabelText("Full name");

    await user.clear(fullNameInput);
    await user.type(fullNameInput, "Samuel Adeyemi");

    const fullNameForm = fullNameInput.closest("form");

    expect(fullNameForm).not.toBeNull();

    const saveButton = within(fullNameForm as HTMLFormElement).getByRole(
      "button",
      { name: "Save" },
    );

    await user.click(saveButton);

    expect(toastSuccess).toHaveBeenCalledWith(
      "Full name updated successfully.",
    );

    expect(
      await screen.findByDisplayValue("Samuel Adeyemi"),
    ).toBeInTheDocument();
  });

  it("does not submit when the full name is empty", async () => {
    const user = userEvent.setup();

    renderProfileSettings();

    const fullNameInput = await screen.findByLabelText("Full name");

    await user.clear(fullNameInput);

    const fullNameForm = fullNameInput.closest("form");

    expect(fullNameForm).not.toBeNull();

    await user.click(
      within(fullNameForm as HTMLFormElement).getByRole("button", {
        name: "Save",
      }),
    );

    expect(fullNameInput).toHaveValue("");
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps the professional role control and save action in the same form", async () => {
    renderProfileSettings();

    const roleSelect = await screen.findByRole("combobox", {
      name: "Professional role",
    });
    const roleForm = roleSelect.closest("form");

    expect(roleForm).not.toBeNull();
    expect(
      within(roleForm as HTMLFormElement).getByRole("button", {
        name: "Save",
      }),
    ).toBeInTheDocument();
  });
});
