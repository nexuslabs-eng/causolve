import { Request, Response } from "express";
import { prisma } from "@causolve/database";
import { type CreateHypothesisRequest, type Hypothesis } from "contracts";
import tryCatchWrapper from "../../../infrastructure/tryCatchWrapper.js";
import {
  sendSuccess,
  sendError,
} from "../../../infrastructure/responseHandler.js";

const toHypothesisResponse = (hypothesis: {
  id: string;
  reference: string;
  investigationId: string;
  statement: string;
  status: string;
  supportStrength: number;
  contradictionPressure: number;
  independentEvidenceGroups: number;
  unresolvedContradictions: number;
  rank: number;
  createdAt: Date;
  updatedAt: Date;
}): Hypothesis => ({
  ...hypothesis,
  status: hypothesis.status as Hypothesis["status"],
  createdAt: hypothesis.createdAt.toISOString(),
  updatedAt: hypothesis.updatedAt.toISOString(),
});

export const createHypothesis = tryCatchWrapper(
  async (
    req: Request<
      { organizationId: string; incidentId: string },
      unknown,
      CreateHypothesisRequest
    >,
    res: Response,
  ): Promise<void> => {
    const { organizationId, incidentId } = req.params;
    const { statement } = req.body;

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

    const hypothesis = await prisma.$transaction(async (tx) => {
      const updatedInvestigation = await tx.investigation.update({
        where: { id: investigation.id },
        data: { hypothesisSequence: { increment: 1 } },
      });

      const created = await tx.hypothesis.create({
        data: {
          investigationId: investigation.id,
          reference: `H${updatedInvestigation.hypothesisSequence}`,
          statement,
          rank: updatedInvestigation.hypothesisSequence,
        },
      });
      await tx.incidentEvent.create({
        data: {
          incidentId,
          actorType: "USER",
          actorId: req.user!.id,
          type: "hypothesis.proposed",
          message: `Hypothesis proposed: ${created.statement}`,
        },
      });
      return created;
    });
    const response: Hypothesis = toHypothesisResponse(hypothesis);
    sendSuccess(res, 201, response);
  },
);
