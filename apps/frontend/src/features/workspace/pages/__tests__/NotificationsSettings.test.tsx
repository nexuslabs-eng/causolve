import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const { toastSuccess } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccess,
    error: vi.fn(),
  },
}));

import { NotificationsSettings } from "@/features/workspace/pages/personal-settings/NotificationsSettings";
import { setAuthSession } from "@/mocks/utils";
import { authenticatedSettingsSession } from "./settings-test-session";

const renderNotificationsSettings = () => {
  setAuthSession(authenticatedSettingsSession);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NotificationsSettings />
    </QueryClientProvider>,
  );
};

describe("NotificationsSettings", () => {
  beforeEach(() => {
    toastSuccess.mockClear();
  });

  it("renders the page heading while preferences load", () => {
    renderNotificationsSettings();

    expect(screen.getByRole("heading", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Loading notifications" })).toBeInTheDocument();
  });

  it("updates a notification preference", async () => {
    const user = userEvent.setup();
    renderNotificationsSettings();

    const emailNotifications = await screen.findByRole("checkbox", {
      name: "Email notifications",
    });

    expect(emailNotifications).toBeChecked();

    await user.click(emailNotifications);

    expect(toastSuccess).toHaveBeenCalledWith("Notification preferences saved.");
    expect(emailNotifications).not.toBeChecked();
  });
});
