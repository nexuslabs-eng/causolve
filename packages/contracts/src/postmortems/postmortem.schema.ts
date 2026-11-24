import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../common/primitives.js";

export const PostmortemStatusSchema = z.enum(["DRAFT", "FINALIZED"]);

export const PreventativeActionSchema = z.object({
  id: IdSchema,
  description: z.string(),
  completed: z.boolean(),
});

export const PostmortemSchema = z.object({
  id: IdSchema,
  incidentId: IdSchema,
  summary: z.string(),
  impact: z.string(),
  rootCause: z.string(),
  preventativeActions: z.array(PreventativeActionSchema),
  status: PostmortemStatusSchema,

  createdAt: DateTimeSchema,
  finalizedAt: DateTimeSchema.nullable(),
});
