import { Request, Response } from "express";
import { Prisma, prisma } from "@causolve/database";
import {
  type CreateIncidentRequest,
  type UpdateIncidentRequest,
  type CreateIncidentEventRequest,
  type Incident,
  type IncidentEvent,
  type IncidentListResponse,
  type IncidentEventListResponse,
  PaginationQuerySchema,
} from "contracts";
import tryCatchWrapper from "../../infrastructure/tryCatchWrapper.js";
import {
  sendSuccess,
  sendError,
} from "../../infrastructure/responseHandler.js";

const toIncidentResponse = (incident: {
  id: string;
  reference: string;
  organizationId: string;
  serviceId: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  commanderId: string | null;
  startedAt: Date;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): Incident => ({
  ...incident,
  severity: incident.severity as Incident["severity"],
  status: incident.status as Incident["status"],
  startedAt: incident.startedAt.toISOString(),
  acknowledgedAt: incident.acknowledgedAt?.toISOString() ?? null,
  resolvedAt: incident.resolvedAt?.toISOString() ?? null,
  createdAt: incident.createdAt.toISOString(),
  updatedAt: incident.updatedAt.toISOString(),
});

const toIncidentEventResponse = (event: {
  id: string;
  incidentId: string;
  actorType: string;
  actorId: string | null;
  type: string;
  message: string;
  metadata: unknown;
  createdAt: Date;
}): IncidentEvent => ({
  ...event,
  actorType: event.actorType as IncidentEvent["actorType"],
  metadata: event.metadata as IncidentEvent["metadata"],
  createdAt: event.createdAt.toISOString(),
});

export const createIncident = tryCatchWrapper(
  async (
    req: Request<{ organizationId: string }, unknown, CreateIncidentRequest>,
    res: Response,
  ): Promise<void> => {
    const { organizationId } = req.params;
    const { serviceId, title, description, severity } = req.body;

    const service = await prisma.service.findFirst({
      where: { id: serviceId, organizationId },
    });

    if (!service) {
      sendError(res, 404, "SERVICE_NOT_FOUND", "Service not found.");
      return;
    }

    const incident = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.update({
        where: { id: organizationId },
        data: { incidentSequence: { increment: 1 } },
      });

      const created = await tx.incident.create({
        data: {
          organizationId,
          serviceId,
          title,
          description: description ?? null,
          severity,
          reference: `INC-${organization.incidentSequence}`,
        },
      });

      await tx.incidentEvent.create({
        data: {
          incidentId: created.id,
          actorType: "USER",
          actorId: req.user!.id,
          type: "incident.created",
          message: `Incident reported: ${created.title}`,
        },
      });
      return created;
    });

    const response: Incident = toIncidentResponse(incident);
    sendSuccess(res, 201, response);
  },
);

export const listIncidents = tryCatchWrapper(
  async (req: Request<{ organizationId: string }>, res: Response) => {
    const { organizationId } = req.params;

    const result = PaginationQuerySchema.safeParse(req.query);
    if (!result.success) {
      sendError(res, 400, "INVALID_REQUEST", "Invalid pagination parameters.");
      return;
    }

    const { page, limit } = result.data;

    const [incidents, totalCount] = await Promise.all([
      prisma.incident.findMany({
        where: { organizationId },
        orderBy: { startedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.incident.count({ where: { organizationId } }),
    ]);
    const response: IncidentListResponse = {
      items: incidents.map(toIncidentResponse),
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
    sendSuccess(res, 200, response);
  },
);

export const getIncident = tryCatchWrapper(
  async (
    req: Request<{ organizationId: string; incidentId: string }>,
    res: Response,
  ) => {
    const { organizationId, incidentId } = req.params;

    const incident = await prisma.incident.findFirst({
      where: { id: incidentId, organizationId },
    });

    if (!incident) {
      sendError(res, 404, "INCIDENT_NOT_FOUND", "Incident not found.");
      return;
    }
    const response: Incident = toIncidentResponse(incident);
    sendSuccess(res, 200, response);
  },
);

export const updateIncident = tryCatchWrapper(
  async (
    req: Request<
      { organizationId: string; incidentId: string },
      unknown,
      UpdateIncidentRequest
    >,
    res: Response,
  ) => {
    const { organizationId, incidentId } = req.params;
    const { status, severity, commanderId } = req.body;

    const existingIncident = await prisma.incident.findFirst({
      where: { id: incidentId, organizationId },
    });

    if (!existingIncident) {
      sendError(res, 404, "INCIDENT_NOT_FOUND", "Incident not found.");
      return;
    }
    if (commanderId) {
      const commanderMembership = await prisma.membership.findFirst({
        where: { userId: commanderId, organizationId },
      });
      if (!commanderMembership) {
        sendError(res, 404, "COMMANDER_NOT_FOUND", "Commander not found.");
        return;
      }
    }

    const data: Prisma.IncidentUncheckedUpdateInput = {};
    const events: Prisma.IncidentEventCreateManyInput[] = [];

    if (status !== undefined && status !== existingIncident.status) {
      data.status = status;
      if (status === "ACKNOWLEDGED" && !existingIncident.acknowledgedAt) {
        data.acknowledgedAt = new Date();
      }
      if (status === "RESOLVED" && !existingIncident.resolvedAt) {
        data.resolvedAt = new Date();
      }
      events.push({
        incidentId,
        actorType: "USER",
        actorId: req.user!.id,
        type: "incident.status_changed",
        message: `Status changed from ${existingIncident.status} to ${status}.`,
      });
    }
    if (severity !== undefined && severity !== existingIncident.severity) {
      data.severity = severity;
      events.push({
        incidentId,
        actorType: "USER",
        actorId: req.user!.id,
        type: "incident.severity_changed",
        message: `Severity changed from ${existingIncident.severity} to ${severity}.`,
      });
    }
    if (
      commanderId !== undefined &&
      commanderId !== existingIncident.commanderId
    ) {
      data.commanderId = commanderId;
      events.push({
        incidentId,
        actorType: "USER",
        actorId: req.user!.id,
        type: "incident.commander_assigned",
        message: commanderId ? "Commander assigned." : "Commander unassigned.",
      });
    }

    const incident = await prisma.$transaction(async (tx) => {
      const updated = await tx.incident.update({
        where: { id: incidentId },
        data,
      });
      if (events.length > 0) {
        await tx.incidentEvent.createMany({ data: events });
      }
      return updated;
    });
    const response: Incident = toIncidentResponse(incident);
    sendSuccess(res, 200, response);
  },
);

export const listIncidentEvents = tryCatchWrapper(
  async (
    req: Request<{ organizationId: string; incidentId: string }>,
    res: Response,
  ): Promise<void> => {
    const { organizationId, incidentId } = req.params;

    const incident = await prisma.incident.findFirst({
      where: { id: incidentId, organizationId },
    });
    if (!incident) {
      sendError(res, 404, "INCIDENT_NOT_FOUND", "Incident not found.");
      return;
    }

    const result = PaginationQuerySchema.safeParse(req.query);
    if (!result.success) {
      sendError(res, 400, "INVALID_REQUEST", "Invalid pagination parameters.");
      return;
    }
    const { page, limit } = result.data;

    const [events, totalCount] = await Promise.all([
      prisma.incidentEvent.findMany({
        where: { incidentId },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.incidentEvent.count({ where: { incidentId } }),
    ]);

    const response: IncidentEventListResponse = {
      items: events.map(toIncidentEventResponse),
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
    sendSuccess(res, 200, response);
  },
);

export const createIncidentEvent = tryCatchWrapper(
  async (
    req: Request<
      { organizationId: string; incidentId: string },
      unknown,
      CreateIncidentEventRequest
    >,
    res: Response,
  ): Promise<void> => {
    const { organizationId, incidentId } = req.params;
    const { type, message, metadata } = req.body;

    const incident = await prisma.incident.findFirst({
      where: { id: incidentId, organizationId },
    });
    if (!incident) {
      sendError(res, 404, "INCIDENT_NOT_FOUND", "Incident not found.");
      return;
    }

    const event = await prisma.incidentEvent.create({
      data: {
        incidentId,
        actorType: "USER",
        actorId: req.user!.id,
        type,
        message,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });

    const response: IncidentEvent = toIncidentEventResponse(event);
    sendSuccess(res, 201, response);
  },
);
