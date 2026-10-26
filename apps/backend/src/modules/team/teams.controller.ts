import { Request, Response } from "express";
import { Prisma, prisma } from "@causolve/database";
import {
  type CreateTeamRequest,
  type UpdateTeamRequest,
  type Team,
  type TeamListResponse,
  type DeleteTeamResponse,
  PaginationQuerySchema,
} from "contracts";
import tryCatchWrapper from "../../infrastructure/tryCatchWrapper.js";
import {
  sendSuccess,
  sendError,
} from "../../infrastructure/responseHandler.js";

const toTeamResponse = (team: {
  id: string;
  organizationId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}): Team => ({
  ...team,
  createdAt: team.createdAt.toISOString(),
  updatedAt: team.updatedAt.toISOString(),
});

export const createTeam = tryCatchWrapper(
  async (
    req: Request<{ organizationId: string }, unknown, CreateTeamRequest>,
    res: Response,
  ): Promise<void> => {
    const { organizationId } = req.params;
    const { name } = req.body;

    let team;
    try {
      team = await prisma.team.create({
        data: { organizationId, name },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        sendError(
          res,
          409,
          "TEAM_NAME_TAKEN",
          "A team with this name already exists in this organization",
        );
        return;
      }
      throw error;
    }
    const response: Team = toTeamResponse(team);
    sendSuccess(res, 201, response);
  },
);

export const listTeams = tryCatchWrapper(
  async (
    req: Request<{ organizationId: string }>,
    res: Response,
  ): Promise<void> => {
    const { organizationId } = req.params;

    const result = PaginationQuerySchema.safeParse(req.query);
    if (!result.success) {
      sendError(res, 400, "INVALID_REQUEST", "Invalid pagination parameters.");
      return;
    }
    const { page, limit } = result.data;

    const [teams, totalCount] = await Promise.all([
      prisma.team.findMany({
        where: { organizationId },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.team.count({ where: { organizationId } }),
    ]);

    const response: TeamListResponse = {
      items: teams.map(toTeamResponse),
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
    sendSuccess(res, 200, response);
  },
);

export const getTeam = tryCatchWrapper(
  async (
    req: Request<{ organizationId: string; teamId: string }>,
    res: Response,
  ): Promise<void> => {
    const { organizationId, teamId } = req.params;

    const team = await prisma.team.findFirst({
      where: { id: teamId, organizationId },
    });

    if (!team) {
      sendError(res, 404, "TEAM_NOT_FOUND", "Team not found.");
      return;
    }

    const response: Team = toTeamResponse(team);
    sendSuccess(res, 200, response);
  },
);

export const updateTeam = tryCatchWrapper(
  async (
    req: Request<
      { organizationId: string; teamId: string },
      unknown,
      UpdateTeamRequest
    >,
    res: Response,
  ): Promise<void> => {
    const { organizationId, teamId } = req.params;
    const { name } = req.body;

    const existingTeam = await prisma.team.findFirst({
      where: { id: teamId, organizationId },
    });

    if (!existingTeam) {
      sendError(res, 404, "TEAM_NOT_FOUND", "Team not found.");
      return;
    }

    let team;
    try {
      team = await prisma.team.update({
        where: { id: teamId },
        data: { name },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        sendError(
          res,
          409,
          "TEAM_NAME_TAKEN",
          "A team with this name already exists in this organization.",
        );
        return;
      }
      throw error;
    }

    const response: Team = toTeamResponse(team);
    sendSuccess(res, 200, response);
  },
);

export const deleteTeam = tryCatchWrapper(
  async (
    req: Request<{ organizationId: string; teamId: string }>,
    res: Response,
  ): Promise<void> => {
    const { organizationId, teamId } = req.params;

    const existingTeam = await prisma.team.findFirst({
      where: { id: teamId, organizationId },
    });

    if (!existingTeam) {
      sendError(res, 404, "TEAM_NOT_FOUND", "Team not found.");
      return;
    }

    await prisma.team.delete({ where: { id: teamId } });

    const response: DeleteTeamResponse = { deleted: true };

    sendSuccess(res, 200, response);
  },
);
