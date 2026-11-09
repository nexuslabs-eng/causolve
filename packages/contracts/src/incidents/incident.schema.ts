import { z } from "zod";
import { IncidentSeveritySchema, IncidentStatusSchema } from "../common/enums.js";
import { DateTimeSchema, IdSchema } from "../common/primitives.js";
import { paginatedResponseSchema } from "../common/pagination.schema.js";

export const IncidentSchema = z.object({
    id: IdSchema,
    reference: z.string().trim().regex(/^INC-\d+$/),
    organizationId: IdSchema,
    serviceId: IdSchema,
    title: z.string(),
    description: z.string().nullable(),
    severity: IncidentSeveritySchema,
    status: IncidentStatusSchema,
    commanderId: IdSchema.nullable(),
    startedAt: DateTimeSchema,
    acknowledgedAt: DateTimeSchema.nullable(),
    resolvedAt: DateTimeSchema.nullable(),
    createdAt: DateTimeSchema,
    updatedAt: DateTimeSchema,
});

export const CreateIncidentRequestSchema = z.object({
    serviceId: IdSchema,
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().max(2000).optional(),
    severity: IncidentSeveritySchema,
});

export const UpdateIncidentRequestSchema = z.object({
    status: IncidentStatusSchema.optional(),
    severity: IncidentSeveritySchema.optional(),
    commanderId: IdSchema.nullable().optional(),
})

export const IncidentListResponseSchema = paginatedResponseSchema(IncidentSchema);


export type Incident = z.infer<typeof IncidentSchema>;
export type CreateIncidentRequest = z.infer<typeof CreateIncidentRequestSchema>
export type UpdateIncidentRequest = z.infer<typeof UpdateIncidentRequestSchema>;
export type IncidentListResponse = z.infer<typeof IncidentListResponseSchema>;
