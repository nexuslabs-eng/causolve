import {
  SiDatadog,
  SiGithub,
  SiGitlab,
  SiGrafana,
  SiGooglecloud,
  SiKubernetes,
  SiOpentelemetry,
  SiPagerduty,
  SiPrometheus,
} from "react-icons/si";
import { FaAws, FaMicrosoft } from "react-icons/fa6";
import type { IconType } from "react-icons/lib";
import type { IntegrationProvider } from "contracts/integrations/integration.schema";

export type IntegrationDefinition = {
  provider: IntegrationProvider;
  name: string;
  description: string;
  icon: IconType;
  iconClassName: string;
};

export const INTEGRATION_DEFINITIONS: IntegrationDefinition[] = [
  {
    provider: "OPEN_TELEMETRY",
    name: "OpenTelemetry",
    description: "Collect vendor-neutral metrics, logs, traces, and metadata.",
    icon: SiOpentelemetry,
    iconClassName: "text-[#F5A800]",
  },
  {
    provider: "GRAFANA_CLOUD",
    name: "Grafana Cloud",
    description: "Connect Prometheus, Loki, Tempo, and alert data.",
    icon: SiGrafana,
    iconClassName: "text-[#F46800]",
  },
  {
    provider: "DATADOG",
    name: "Datadog",
    description: "Connect metrics, logs, traces, service maps, and monitors.",
    icon: SiDatadog,
    iconClassName: "text-[#632CA6]",
  },
  {
    provider: "PAGERDUTY",
    name: "PagerDuty",
    description: "Connect alerts, incidents, responders, and timelines.",
    icon: SiPagerduty,
    iconClassName: "text-[#06AC38]",
  },
  {
    provider: "GITHUB",
    name: "GitHub",
    description: "Link commits, pull requests, releases, and deployments.",
    icon: SiGithub,
    iconClassName: "text-foreground",
  },
  {
    provider: "GITLAB",
    name: "GitLab",
    description: "Link commits, merge requests, pipelines, and deployments.",
    icon: SiGitlab,
    iconClassName: "text-[#FC6D26]",
  },
  {
    provider: "KUBERNETES",
    name: "Kubernetes",
    description: "Inspect workload state, topology, and cluster events.",
    icon: SiKubernetes,
    iconClassName: "text-[#326CE5]",
  },
  {
    provider: "PROMETHEUS",
    name: "Prometheus",
    description: "Connect runtime metrics and alerting data.",
    icon: SiPrometheus,
    iconClassName: "text-[#E6522C]",
  },
  {
    provider: "AWS",
    name: "Amazon Web Services",
    description: "Connect infrastructure metrics, logs, and audit events.",
    icon: FaAws,
    iconClassName: "text-[#FF9900]",
  },
  {
    provider: "GOOGLE_CLOUD",
    name: "Google Cloud",
    description: "Connect infrastructure metrics, logs, and audit events.",
    icon: FaMicrosoft,
    iconClassName: "text-[#4285F4]",
  },
  {
    provider: "AZURE",
    name: "Microsoft Azure",
    description: "Connect infrastructure metrics, logs, and audit events.",
    icon: SiGooglecloud,
    iconClassName: "text-[#0078D4]",
  },
];

export const INTEGRATION_STATUS_LABELS = {
  CONNECTED: "Connected",
  DISCONNECTED: "Not connected",
  ERROR: "Connection error",
} as const;
