import { Request, Response } from "express";
import { Prisma, prisma } from "@resolve-os/database";
import {
  type CreateServiceRequest,
  type UpdateServiceRequest,
  type Service,
  type ServiceListResponse,
  type DeleteServiceResponse,
  PaginationQuerySchema,
} from "contracts";
import tryCatchWrapper from "../../infrastructure/tryCatchWrapper.js";
import {
  sendSuccess,
  sendError,
} from "../../infrastructure/responseHandler.js";

const toServiceResponse = (service: {
  id: string;
  organizationId: string;
  teamId: string | null;
  name: string;
  environment: string;
  healthStatus: string;
  currentVersion: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Service => ({
  ...service,
  healthStatus: service.healthStatus as Service["healthStatus"],
  createdAt: service.createdAt.toISOString(),
  updatedAt: service.updatedAt.toISOString(),
});

export const createService = tryCatchWrapper(
  async (
    req: Request<{ organizationId: string }, unknown, CreateServiceRequest>,
    res: Response,
  ): Promise<void> => {
    const { organizationId } = req.params;
    const { name, environment, teamId } = req.body;

    if (teamId !== undefined) {
      const team = await prisma.team.findFirst({
        where: { id: teamId, organizationId },
      });
      if (!team) {
        sendError(res, 404, "TEAM_NOT_FOUND", "Team not found.");
        return;
      }
    }

    let service;
    try {
      service = await prisma.service.create({
        data: { organizationId, name, environment, teamId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        sendError(
          res,
          409,
          "SERVICE_NAME_TAKEN",
          "A service with this name already exists in this organization.",
        );
        return;
      }
      throw error;
    }
    const response: Service = toServiceResponse(service);
    sendSuccess(res, 201, response);
  },
);

export const listServices = tryCatchWrapper(
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

    const [services, totalCount] = await Promise.all([
      prisma.service.findMany({
        where: { organizationId },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.service.count({ where: { organizationId } }),
    ]);
    const response: ServiceListResponse = {
      items: services.map(toServiceResponse),
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
    sendSuccess(res, 200, response);
  },
);

export const getService = tryCatchWrapper(
  async (
    req: Request<{ organizationId: string; serviceId: string }>,
    res: Response,
  ): Promise<void> => {
    const { organizationId, serviceId } = req.params;

    const service = await prisma.service.findFirst({
      where: { id: serviceId, organizationId },
    });

    if (!service) {
      sendError(res, 404, "SERVICE_NOT_FOUND", "Service not found.");
      return;
    }

    const response: Service = toServiceResponse(service);
    sendSuccess(res, 200, response);
  },
);

export const updateService = tryCatchWrapper(
  async (
    req: Request<
      { organizationId: string; serviceId: string },
      unknown,
      UpdateServiceRequest
    >,
    res: Response,
  ): Promise<void> => {
    const { organizationId, serviceId } = req.params;
    const { name, environment, teamId } = req.body;

    const existingService = await prisma.service.findFirst({
      where: { id: serviceId, organizationId },
    });

    if (!existingService) {
      sendError(res, 404, "SERVICE_NOT_FOUND", "Service not found.");
      return;
    }

    if (teamId !== undefined) {
      const team = await prisma.team.findFirst({
        where: { id: teamId, organizationId },
      });
      if (!team) {
        sendError(res, 404, "TEAM_NOT_FOUND", "Team not found.");
        return;
      }
    }

    let service;
    try {
      service = await prisma.service.update({
        where: { id: serviceId },
        data: { name, environment, teamId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        sendError(
          res,
          409,
          "SERVICE_NAME_TAKEN",
          "A service with this name already exists in this organization.",
        );
        return;
      }
      throw error;
    }

    const response: Service = toServiceResponse(service);
    sendSuccess(res, 200, response);
  },
);

export const deleteService = tryCatchWrapper(
  async (
    req: Request<{ organizationId: string; serviceId: string }>,
    res: Response,
  ): Promise<void> => {
    const { organizationId, serviceId } = req.params;

    const existingService = await prisma.service.findFirst({
      where: { id: serviceId, organizationId },
    });

    if (!existingService) {
      sendError(res, 404, "SERVICE_NOT_FOUND", "Service not found.");
      return;
    }

    await prisma.service.delete({ where: { id: serviceId } });

    const response: DeleteServiceResponse = { deleted: true };

    sendSuccess(res, 200, response);
  },
);
