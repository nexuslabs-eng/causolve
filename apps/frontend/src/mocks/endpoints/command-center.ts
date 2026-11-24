import { http, HttpResponse } from "msw";
import { commandCenterFixture } from "@/mocks/fixtures/command-center";
import { apiError } from "@/mocks/utils";

export const incident = http.get("*/incidents/:incidentId/command-center", ({ params }) => {
  if (params.incidentId !== commandCenterFixture.incident.id)
    return HttpResponse.json(apiError("INCIDENT_NOT_FOUND", "Incident not found."), {
      status: 404,
    });

  return HttpResponse.json(commandCenterFixture);
});
