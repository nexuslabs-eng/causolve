import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { NotificationsSettings } from "@/features/workspace/pages/NotificationsSettings";
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
  it("renders the page heading while preferences load", () => {
    renderNotificationsSettings();

    expect(
      screen.getByRole("heading", { name: "Notifications" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Loading notification settings"),
    ).toBeInTheDocument();
  });

  it("updates a notification preference", async () => {
    const user = userEvent.setup();
    renderNotificationsSettings();

    const emailNotifications = await screen.findByRole("checkbox", {
      name: "Email notifications",
    });

    expect(emailNotifications).toBeChecked();

    await user.click(emailNotifications);

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Notification preferences saved.",
    );
    expect(emailNotifications).not.toBeChecked();
  });
});
