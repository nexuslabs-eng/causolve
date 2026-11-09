import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../common/primitives.js";
import { paginatedResponseSchema } from "../common/pagination.schema.js";

export const ActorTypeSchema = z.enum(["USER", "AI", "SYSTEM"]);

export const IncidentEventSchema = z.object({
    id: IdSchema,
    incidentId: IdSchema,
    actorType: ActorTypeSchema,
    actorId: IdSchema.nullable(),
    type: z.string(),
    message: z.string(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: DateTimeSchema,
});

export const CreateIncidentEventRequestSchema = z.object({
    type: z.string().trim().min(1).max(100),
    message: z.string().trim().min(1).max(2000),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export const IncidentEventListResponseSchema = paginatedResponseSchema(IncidentEventSchema);

export type IncidentEvent = z.infer<typeof IncidentEventSchema>;
export type CreateIncidentEventRequest = z.infer<typeof CreateIncidentEventRequestSchema>;
export type IncidentEventListResponse = z.infer<typeof IncidentEventListResponseSchema>;
