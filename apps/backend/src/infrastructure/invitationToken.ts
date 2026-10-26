import crypto from "node:crypto";
import { prisma } from "@causolve/database";

export const findInvitationByToken = async (rawToken: string) => {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  return prisma.invitation.findUnique({
    where: { tokenHash },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
      invitedBy: { select: { id: true, fullName: true } },
    },
  });
};

export const isInvitationExpired = (expiresAt: Date): boolean =>
  expiresAt < new Date();

export const getEffectiveInvitationStatus = (
  status: string,
  expiresAt: Date,
): string =>
  status === "PENDING" && isInvitationExpired(expiresAt) ? "EXPIRED" : status;
