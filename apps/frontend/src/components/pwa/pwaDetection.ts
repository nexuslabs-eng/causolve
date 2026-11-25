export type AppleDevice = "iphone" | "ipad" | "ipod" | "mac" | null;

interface AppleNavigator extends Navigator {
  standalone?: boolean;
}

export const detectAppleDevice = (): AppleDevice => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return null;
  }

  const userAgent = navigator.userAgent;

  if (/iPhone/.test(userAgent)) return "iphone";
  if (/iPod/.test(userAgent)) return "ipod";
  if (/iPad/.test(userAgent)) return "ipad";

  // Modern iPadOS reports a "Macintosh" user agent by default
  if (/Macintosh/.test(userAgent)) {
    return navigator.maxTouchPoints > 1 ? "ipad" : "mac";
  }

  return null;
};

export const isStandaloneMode = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const nav = window.navigator as AppleNavigator;
  const isAppleStandalone = nav.standalone === true;
  const isDisplayStandalone = window.matchMedia?.("(display-mode: standalone)").matches ?? false;

  return isAppleStandalone || isDisplayStandalone;
};
