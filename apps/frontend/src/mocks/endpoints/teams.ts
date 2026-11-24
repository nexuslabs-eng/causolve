import {
  CreateTeamRequestSchema,
  DeleteTeamResponseSchema,
  TeamListResponseSchema,
  TeamSchema,
  UpdateTeamRequestSchema,
  type Team,
} from "contracts/teams/team.schema";
import { http, HttpResponse } from "msw";
import { apiEndpoint } from "@/lib/api/api-config";
import { apiError } from "@/mocks/utils";
import { getAuthSession } from "@/mocks/auth-state";

const STORAGE_KEY = "causolve_mock_teams";

const createId = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : "00000000-0000-4000-8000-000000000000";

const requireWorkspace = (organizationId: string, adminOnly = false) => {
  const session = getAuthSession();

  if (!session.authenticated) {
    return HttpResponse.json(apiError("UNAUTHENTICATED", "You must be signed in."), {
      status: 401,
    });
  }

  if (session.activeWorkspace?.organizationId !== organizationId) {
    return HttpResponse.json(apiError("ORGANIZATION_NOT_FOUND", "Organization not found."), {
      status: 404,
    });
  }

  if (adminOnly && session.membership?.role !== "ADMIN") {
    return HttpResponse.json(apiError("FORBIDDEN", "Administrator access is required."), {
      status: 403,
    });
  }

  return null;
};

const readTeams = (organizationId: string): Team[] => {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (team): team is Team =>
        TeamSchema.safeParse(team).success && team.organizationId === organizationId,
    );
  } catch {
    return [];
  }
};

const writeTeams = (organizationId: string, teams: Team[]) => {
  const existing = readTeamsForAllOrganizations();
  const otherTeams = existing.filter((team) => team.organizationId !== organizationId);
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify([...otherTeams, ...teams]));
};

const readTeamsForAllOrganizations = (): Team[] => {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.flatMap((team) => {
          const result = TeamSchema.safeParse(team);
          return result.success ? [result.data] : [];
        })
      : [];
  } catch {
    return [];
  }
};

export const listTeams = http.get(
  apiEndpoint("/organizations/:organizationId/teams"),
  ({ params, request }) => {
    const organizationId = String(params.organizationId);
    const authenticationError = requireWorkspace(organizationId);
    if (authenticationError) return authenticationError;

    const url = new URL(request.url);
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 10), 1), 100);
    const teams = readTeams(organizationId).sort(
      (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
    );
    const items = teams.slice((page - 1) * limit, page * limit);

    return HttpResponse.json(
      TeamListResponseSchema.parse({
        items,
        page,
        limit,
        totalCount: teams.length,
        totalPages: Math.ceil(teams.length / limit),
      }),
    );
  },
);

export const createTeam = http.post(
  apiEndpoint("/organizations/:organizationId/teams"),
  async ({ params, request }) => {
    const organizationId = String(params.organizationId);
    const authenticationError = requireWorkspace(organizationId, true);
    if (authenticationError) return authenticationError;
    const result = CreateTeamRequestSchema.safeParse(await request.json());
    if (!result.success)
      return HttpResponse.json(apiError("INVALID_REQUEST", "Invalid team name."), { status: 400 });
    const teams = readTeams(organizationId);
    if (teams.some((team) => team.name.toLowerCase() === result.data.name.toLowerCase()))
      return HttpResponse.json(
        apiError("TEAM_NAME_TAKEN", "A team with this name already exists."),
        { status: 409 },
      );
    const now = new Date().toISOString();
    const team = TeamSchema.parse({
      id: createId(),
      organizationId,
      name: result.data.name,
      createdAt: now,
      updatedAt: now,
    });
    writeTeams(organizationId, [...teams, team]);
    return HttpResponse.json(team, { status: 201 });
  },
);

export const updateTeam = http.patch(
  apiEndpoint("/organizations/:organizationId/teams/:teamId"),
  async ({ params, request }) => {
    const organizationId = String(params.organizationId);
    const teamId = String(params.teamId);
    const authenticationError = requireWorkspace(organizationId, true);
    if (authenticationError) return authenticationError;
    const result = UpdateTeamRequestSchema.safeParse(await request.json());
    if (!result.success)
      return HttpResponse.json(apiError("INVALID_REQUEST", "Invalid team name."), { status: 400 });
    const teams = readTeams(organizationId);
    const index = teams.findIndex((team) => team.id === teamId);
    if (index < 0)
      return HttpResponse.json(apiError("TEAM_NOT_FOUND", "Team not found."), { status: 404 });
    if (
      teams.some(
        (team) => team.id !== teamId && team.name.toLowerCase() === result.data.name.toLowerCase(),
      )
    )
      return HttpResponse.json(
        apiError("TEAM_NAME_TAKEN", "A team with this name already exists."),
        { status: 409 },
      );
    const updated = TeamSchema.parse({
      ...teams[index],
      name: result.data.name,
      updatedAt: new Date().toISOString(),
    });
    teams[index] = updated;
    writeTeams(organizationId, teams);
    return HttpResponse.json(updated);
  },
);

export const deleteTeam = http.delete(
  apiEndpoint("/organizations/:organizationId/teams/:teamId"),
  ({ params }) => {
    const organizationId = String(params.organizationId);
    const teamId = String(params.teamId);
    const authenticationError = requireWorkspace(organizationId, true);
    if (authenticationError) return authenticationError;
    const teams = readTeams(organizationId);
    if (!teams.some((team) => team.id === teamId))
      return HttpResponse.json(apiError("TEAM_NOT_FOUND", "Team not found."), { status: 404 });
    writeTeams(
      organizationId,
      teams.filter((team) => team.id !== teamId),
    );
    return HttpResponse.json(DeleteTeamResponseSchema.parse({ deleted: true }));
  },
);
