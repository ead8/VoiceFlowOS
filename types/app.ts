export type AgentStatus = "draft" | "active" | "paused";

export type CallResolutionStatus = "completed" | "transferred" | "voicemail" | "spam" | "failed";

export type CallLifecycleStatus = "in_progress" | "completed" | "missed" | "failed" | "voicemail" | "spam";

export type PlanTier = "starter" | "pro" | "enterprise";

export type BillingAccessStatus =
  | "unconfigured"
  | "inactive"
  | "active"
  | "meter_exhausted"
  | "past_due"
  | "cancelled";

export type KnowledgeSourceType = "pdf" | "text" | "faq";

export type KnowledgeDocumentStatus = "processing" | "ready" | "failed";

export type IntegrationStatus = "disconnected" | "connected" | "error";

export type LeadQualification = "high" | "medium" | "low";

export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export type AgentRecord = {
  id: string;
  userId: string;
  name: string;
  voice: string;
  instructions: string;
  phoneNumber: string;
  status: AgentStatus;
  retellAgentId: string | null;
  retellPhoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CallRecord = {
  id: string;
  externalCallId: string | null;
  agentId: string;
  agentName: string;
  callerNumber: string;
  durationSeconds: number;
  transcript: string | null;
  summary: string | null;
  resolutionStatus: CallResolutionStatus;
  status: CallLifecycleStatus;
  recordingUrl: string | null;
  createdAt: string;
};

export type DashboardMetrics = {
  callsToday: number;
  callsThisWeek: number;
  averageDurationSeconds: number;
  totalAgents: number;
};

export type BusinessProfileRecord = {
  userId: string;
  companyName: string | null;
  plan: PlanTier;
  industry: string | null;
  businessPhone: string | null;
  timezone: string;
  transferPhoneNumber: string | null;
  spamScreeningEnabled: boolean;
  voicemailDetectionEnabled: boolean;
  languages: string[];
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeDocumentRecord = {
  id: string;
  userId: string;
  agentId: string | null;
  title: string;
  sourceType: KnowledgeSourceType;
  content: string | null;
  sourceUrl: string | null;
  status: KnowledgeDocumentStatus;
  createdAt: string;
  updatedAt: string;
};

export type LeadRecord = {
  id: string;
  userId: string;
  callId: string | null;
  name: string | null;
  phoneNumber: string | null;
  budget: string | null;
  timeline: string | null;
  problem: string | null;
  location: string | null;
  qualification: LeadQualification | null;
  createdAt: string;
};

export type AppointmentRecord = {
  id: string;
  userId: string;
  agentId: string | null;
  agentName: string | null;
  callId: string | null;
  provider: string;
  externalEventId: string | null;
  contactName: string | null;
  contactPhone: string | null;
  scheduledFor: string;
  notes: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsOverview = {
  totalCalls: number;
  transferredCalls: number;
  voicemailCalls: number;
  spamCalls: number;
  completedCalls: number;
  totalLeads: number;
  highValueLeads: number;
  scheduledAppointments: number;
  averageDurationSeconds: number;
};

export type BillingPlan = {
  id: PlanTier;
  name: string;
  price: string;
  description: string;
  allowance: string;
  productId: string | null;
  highlight?: boolean;
};

export type BillingSummary = {
  configured: boolean;
  active: boolean;
  status: BillingAccessStatus;
  customerId: string | null;
  planId: PlanTier | null;
  planName: string | null;
  subscriptionsCount: number;
  periodStart: string | null;
  periodEnd: string | null;
  minutesIncluded: number | null;
  minutesRemaining: number | null;
  minutesUsed: number | null;
  minuteMeterConfigured: boolean;
  checkoutAvailable: boolean;
  portalAvailable: boolean;
  message: string;
};

export type IntegrationCard = {
  title: string;
  configured: boolean;
  detail: string;
  hint?: string;
};
