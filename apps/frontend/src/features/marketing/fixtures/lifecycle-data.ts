export type Actor = "ai" | "human" | "system";

interface Stage {
  id: string;
  label: string;
  body: string;
  actor: Actor;
}

export const STAGES: Stage[] = [
  {
    id: "detect",
    label: "Detect",
    body: "Signal arrives and an incident record opens.",
    actor: "system",
  },
  {
    id: "acknowledge",
    label: "Acknowledge",
    body: "A responder takes ownership.",
    actor: "human",
  },
  {
    id: "investigate",
    label: "Investigate",
    body: "Controlled tools gather evidence.",
    actor: "ai",
  },
  {
    id: "understand",
    label: "Understand",
    body: "Evidence becomes a ranked hypothesis.",
    actor: "ai",
  },
  {
    id: "approve",
    label: "Approve",
    body: "An authorized human clears the action.",
    actor: "human",
  },
  {
    id: "remediate",
    label: "Remediate",
    body: "The approved fix is executed.",
    actor: "system",
  },
  {
    id: "verify",
    label: "Verify",
    body: "Health is re-checked against the impact.",
    actor: "system",
  },
  {
    id: "resolve",
    label: "Resolve",
    body: "State closes with the full record intact.",
    actor: "human",
  },
  {
    id: "learn",
    label: "Learn",
    body: "Postmortem is drafted from real context.",
    actor: "ai",
  },
];

export const ACTOR_STYLE: Record<Actor, { dot: string; label: string; text: string }> = {
  ai: {
    dot: "bg-primary-bright",
    label: "AI assisted",
    text: "text-primary-bright",
  },
  human: {
    dot: "bg-success",
    label: "Human controlled",
    text: "text-success",
  },
  system: {
    dot: "bg-info",
    label: "System",
    text: "text-info",
  },
};
