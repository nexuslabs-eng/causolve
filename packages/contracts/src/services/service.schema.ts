import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../common/primitives.js";
import { ServiceHealthStatusSchema } from "../common/enums.js";
import { paginatedResponseSchema } from "../common/pagination.schema.js";

export const ServiceSchema = z.object({
  id: IdSchema,
  organizationId: IdSchema,
  teamId: IdSchema.nullable(),
  name: z.string(),
  environment: z.string(),
  healthStatus: ServiceHealthStatusSchema,
  currentVersion: z.string().nullable(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

export const CreateServiceRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  environment: z.string().trim().min(1).max(50),
  teamId: IdSchema.optional(),
});

export const UpdateServiceRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  environment: z.string().trim().min(1).max(50),
  teamId: IdSchema.optional(),
});

export const ServiceListResponseSchema = paginatedResponseSchema(ServiceSchema);

export const DeleteServiceResponseSchema = z.object({
  deleted: z.literal(true),
});

export type Service = z.infer<typeof ServiceSchema>;
export type CreateServiceRequest = z.infer<typeof CreateServiceRequestSchema>;
export type UpdateServiceRequest = z.infer<typeof UpdateServiceRequestSchema>;
export type ServiceListResponse = z.infer<typeof ServiceListResponseSchema>;
export type DeleteServiceResponse = z.infer<typeof DeleteServiceResponseSchema>;
