import { describe, expect, it } from "vite-plus/test";
import { meetsMinimumRole } from "../rbac.policy.js";

describe("meetsMinimumRole", () => {
  it("returns true when the role exactly matches the minimum", () => {
    expect(meetsMinimumRole("ENGINEER", "ENGINEER")).toBe(true);
  });

  it("returns true when the role outranks the minimum", () => {
    expect(meetsMinimumRole("ADMIN", "OBSERVER")).toBe(true);
    expect(meetsMinimumRole("INCIDENT_COMMANDER", "ENGINEER")).toBe(true);
  });

  it("returns false when the role is below the minimum", () => {
    expect(meetsMinimumRole("OBSERVER", "ENGINEER")).toBe(false);
    expect(meetsMinimumRole("ENGINEER", "ADMIN")).toBe(false);
  });
});
