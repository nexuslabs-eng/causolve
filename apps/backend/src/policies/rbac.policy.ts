import type { Role } from "@causolve/database";

const ROLE_RANKS: Record<Role, number> = {
  OBSERVER: 0,
  ENGINEER: 1,
  INCIDENT_COMMANDER: 2,
  ADMIN: 3,
};

export const meetsMinimumRole = (
  currentRole: Role,
  minimumRole: Role,
): boolean => ROLE_RANKS[currentRole] >= ROLE_RANKS[minimumRole];
