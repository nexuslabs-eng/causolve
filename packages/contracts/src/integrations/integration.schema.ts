import { z } from "zod";
import { DateTimeSchema, IdSchema } from "../common/primitives.js";

export const IntegrationProviderSchema = z.enum([
  "OPEN_TELEMETRY",
  "GRAFANA_CLOUD",
  "DATADOG",
  "PAGERDUTY",
  "GITHUB",
  "GITLAB",
  "KUBERNETES",
  "PROMETHEUS",
  "AWS",
  "GOOGLE_CLOUD",
  "AZURE",
]);

export const IntegrationStatusSchema = z.enum([
  "CONNECTED",
  "DISCONNECTED",
  "ERROR",
]);

export const IntegrationSchema = z.object({
  id: IdSchema,
  organizationId: IdSchema,
  provider: IntegrationProviderSchema,
  status: IntegrationStatusSchema,
  connectedAt: DateTimeSchema.nullable(),
  updatedAt: DateTimeSchema,
});

export const IntegrationListResponseSchema = z.object({
  integrations: z.array(IntegrationSchema),
});

export const ConnectIntegrationResponseSchema = z.object({
  redirectUrl: z.url(),
});

export const DisconnectIntegrationResponseSchema = z.object({
  disconnected: z.literal(true),
});

export type IntegrationProvider = z.infer<typeof IntegrationProviderSchema>;
export type IntegrationStatus = z.infer<typeof IntegrationStatusSchema>;
export type Integration = z.infer<typeof IntegrationSchema>;
export type IntegrationListResponse = z.infer<
  typeof IntegrationListResponseSchema
>;
export type ConnectIntegrationResponse = z.infer<
  typeof ConnectIntegrationResponseSchema
>;
export type DisconnectIntegrationResponse = z.infer<
  typeof DisconnectIntegrationResponseSchema
>;
