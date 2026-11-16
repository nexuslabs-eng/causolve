const configuredApiUrl =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, "");

export const apiEndpoint = (path: string) =>
  `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
