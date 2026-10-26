import crypto from "node:crypto";
import { prisma } from "@causolve/database";

export const findUserByResetToken = async (rawToken: string) => {
  const passwordResetTokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return prisma.user.findUnique({
    where: { passwordResetTokenHash },
    select: {
      id: true,
      email: true,
      fullName: true,
      passwordResetTokenExpires: true,
    },
  });
};

export const isResetTokenExpired = (
  passwordResetTokenExpires: Date | null,
): boolean =>
  !passwordResetTokenExpires || passwordResetTokenExpires < new Date();
