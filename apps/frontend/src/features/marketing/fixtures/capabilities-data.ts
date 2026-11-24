export const TIMELINE = [
  {
    at: "13:58",
    label: "Alert ingested",
    tone: "text-destructive",
  },
  {
    at: "14:00",
    label: "Incident declared HIGH",
    tone: "text-destructive",
  },
  {
    at: "14:02",
    label: "Investigation complete",
    tone: "text-primary-bright",
  },
  {
    at: "14:03",
    label: "Traffic shift authorized",
    tone: "text-success",
  },
  {
    at: "14:07",
    label: "Recovery verified",
    tone: "text-success",
  },
];

export const SERVICES = [
  {
    name: "checkout-api",
    owner: "payments",
    state: "degraded",
    tone: "text-destructive",
  },
  {
    name: "payments-worker",
    owner: "payments",
    state: "healthy",
    tone: "text-success",
  },
  {
    name: "ledger-svc",
    owner: "core",
    state: "healthy",
    tone: "text-success",
  },
];

export const HUMAN_CONTROLLED_REMEDIATION = [
  {
    key: "low risk",
    value: "auto-eligible",
    tone: "text-success",
  },
  {
    key: "medium risk",
    value: "1 approver",
    tone: "text-warning",
  },
  {
    key: "high risk",
    value: "2 approvers",
    tone: "text-destructive",
  },
];
