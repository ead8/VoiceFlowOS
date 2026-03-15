export type AgentStatus = "active" | "draft" | "paused";

export type CallStatus = "resolved" | "transferred" | "voicemail" | "screened";

export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type FeatureTrack = {
  eyebrow: string;
  title: string;
  copy: string;
};

export type WorkflowStep = {
  title: string;
  detail: string;
};

export type ArchitectureLayer = {
  title: string;
  note: string;
  items: string[];
};

export type TimelineItem = {
  label: string;
  focus: string;
  detail: string;
};

export type RoadmapPhase = {
  title: string;
  goal: string;
  duration: string;
  outcomes: string[];
};

export type PricingTier = {
  name: string;
  price: string;
  description: string;
  allowance: string;
  highlight?: boolean;
};

export type RiskItem = {
  title: string;
  mitigation: string;
};

export type Agent = {
  id: string;
  name: string;
  voice: string;
  phoneNumber: string;
  instructions: string;
  specialty: string;
  status: AgentStatus;
  callsHandled: string;
  resolutionRate: string;
};

export type CallLog = {
  id: string;
  caller: string;
  agent: string;
  duration: string;
  timestamp: string;
  summary: string;
  status: CallStatus;
};
