export const enableMocking = async () => {
  const shouldEnableMocking = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === "true";

  if (!shouldEnableMocking) {
    return;
  }

  const { worker } = await import("./browser");

  return worker.start({
    onUnhandledRequest: "bypass",
  });
};
