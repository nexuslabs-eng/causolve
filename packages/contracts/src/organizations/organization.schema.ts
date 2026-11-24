import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../common/primitives.js";

export const OrganizationSchema = z.object({
  id: IdSchema,
  name: z.string().min(1).max(120),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

export const CreateOrganizationRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export type Organization = z.infer<typeof OrganizationSchema>;
export type CreateOrganizationRequest = z.infer<typeof CreateOrganizationRequestSchema>;
