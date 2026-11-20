import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { queryClient } from "@/lib/query-client";
import { server } from "@/mocks/server";
import { resetMockState } from "@/mocks/utils";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetMockState();
  queryClient.clear();
});

afterAll(() => {
  server.close();
});
