import { Request, Response } from "express";
import { prisma } from "@causolve/database";
import { type Investigation } from "contracts";
import tryCatchWrapper from "../../infrastructure/tryCatchWrapper.js";
import {
  sendSuccess,
  sendError,
} from "../../infrastructure/responseHandler.js";

const toInvestigationResponse = (investigation: {
  id: string;
  incidentId: string;
  status: string;
  integrity: string;
  evidenceCoverage: number;
  leadingHypothesisId: string | null;
  startedAt: Date;
  completedAt: Date | null;
}): Investigation => ({
  ...investigation,
  status: investigation.status as Investigation["status"],
  integrity: investigation.integrity as Investigation["integrity"],
  startedAt: investigation.startedAt.toISOString(),
  completedAt: investigation.completedAt?.toISOString() ?? null,
});

export const createInvestigation = tryCatchWrapper(
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
    const existingInvestigation = await prisma.investigation.findUnique({
      where: { incidentId },
    });

    if (existingInvestigation) {
      sendError(
        res,
        409,
        "INVESTIGATION_ALREADY_EXISTS",
        "An investigation has already been started for this incident.",
      );
      return;
    }
    const investigation = await prisma.$transaction(async (tx) => {
      const created = await tx.investigation.create({
        data: { incidentId },
      });

      await tx.incidentEvent.create({
        data: {
          incidentId,
          actorType: "USER",
          actorId: req.user!.id,
          type: "investigation.started",
          message: "Investigation started.",
        },
      });
      return created;
    });
    const response: Investigation = toInvestigationResponse(investigation);
    sendSuccess(res, 201, response);
  },
);

export const getInvestigation = tryCatchWrapper(
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

    const investigation = await prisma.investigation.findUnique({
      where: { incidentId },
    });
    if (!investigation) {
      sendError(
        res,
        404,
        "INVESTIGATION_NOT_FOUND",
        "No investigation has been started for this incident.",
      );
      return;
    }
    const response: Investigation = toInvestigationResponse(investigation);
    sendSuccess(res, 200, response);
  },
);
