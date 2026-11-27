export const enableMocking = async () => {
  const explicitlyDisabled = import.meta.env.VITE_ENABLE_MSW === "false";

  const shouldEnable =
    !explicitlyDisabled && (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === "true");

  if (!shouldEnable) {
    return;
  }

  const { worker } = await import("./browser");

  await worker.start({
    onUnhandledRequest: "bypass",
  });
};
