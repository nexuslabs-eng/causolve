type IdleDeadlineLike = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type IdleGlobal = typeof globalThis & {
  requestIdleCallback?: (
    callback: (deadline: IdleDeadlineLike) => void,
    options?: { timeout?: number },
  ) => number;
  cancelIdleCallback?: (id: number) => void;
};

const idleGlobal = globalThis as IdleGlobal;

export const scheduleIdle = (callback: () => void) => {
  if (typeof idleGlobal.requestIdleCallback === "function") {
    const idleId = idleGlobal.requestIdleCallback(() => callback(), {
      timeout: 5000,
    });

    return () => {
      idleGlobal.cancelIdleCallback?.(idleId);
    };
  }

  const timeoutId = globalThis.setTimeout(callback, 5000);

  return () => {
    globalThis.clearTimeout(timeoutId);
  };
};
