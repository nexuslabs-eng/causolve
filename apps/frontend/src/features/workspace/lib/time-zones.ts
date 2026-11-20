const FALLBACK_TIME_ZONES = [
  "Africa/Lagos",
  "America/Los_Angeles",
  "America/New_York",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Paris",
  "Pacific/Auckland",
  "UTC",
];

export const getSupportedTimeZones = () => {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone");
  }

  return FALLBACK_TIME_ZONES;
};

export const getCurrentTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Lagos";
