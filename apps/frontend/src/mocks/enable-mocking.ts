export const enableMocking = async () => {
    if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === "false") {
        return;
    }

    const { worker } = await import("./browser");

    return worker.start({
        onUnhandledRequest: "bypass",
    });
};