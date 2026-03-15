import type {
  Agent,
  ArchitectureLayer,
  CallLog,
  FeatureTrack,
  Metric,
  PricingTier,
  RiskItem,
  RoadmapPhase,
  TimelineItem,
  WorkflowStep,
} from "./types";

export const heroMetrics: Metric[] = [
  {
    label: "Calls Today",
    value: "48",
    detail: "Live dashboard target for the MVP validation loop.",
  },
  {
    label: "Calls This Week",
    value: "312",
    detail: "Tracked per agent, per business account, with searchable transcripts.",
  },
  {
    label: "Average Duration",
    value: "4m 18s",
    detail: "Long enough for FAQs, intake, and appointment capture.",
  },
];

export const featureTracks: FeatureTrack[] = [
  {
    eyebrow: "Authentication",
    title: "Better Auth accounts with billing-aware workspace access.",
    copy: "Each business gets secure sessions, owner onboarding, and a clean path into paid workspace features.",
  },
  {
    eyebrow: "AI Agents",
    title: "Simple agent creation with name, instructions, voice, and phone number.",
    copy: "The first build flow is intentionally lightweight so users can get from idea to working phone assistant fast.",
  },
  {
    eyebrow: "Voice Stack",
    title: "Twilio for the call, Retell AI for dialogue, ElevenLabs for delivery.",
    copy: "VoiceFlowOS stitches the voice pipeline together so businesses do not have to orchestrate raw telecom APIs.",
  },
  {
    eyebrow: "Call Logging",
    title: "Every conversation becomes searchable operational data.",
    copy: "Caller number, transcript, duration, summary, timestamp, and agent routing all land in the dashboard.",
  },
];

export const workflowSteps: WorkflowStep[] = [
  {
    title: "Inbound call",
    detail: "A customer dials the business number connected to the AI agent.",
  },
  {
    title: "Voice orchestration",
    detail: "Twilio hands the call into the Retell AI conversation engine with the selected voice profile.",
  },
  {
    title: "Natural conversation",
    detail: "The agent greets, asks follow-up questions, and responds based on the configured instructions.",
  },
  {
    title: "Structured logging",
    detail: "When the call ends, VoiceFlowOS stores transcript, duration, caller, timestamp, and outcome in the dashboard.",
  },
];

export const architectureLayers: ArchitectureLayer[] = [
  {
    title: "Frontend",
    note: "Next.js App Router, Tailwind, and React Query for the product shell.",
    items: ["marketing experience", "owner dashboard", "agent setup flow"],
  },
  {
    title: "Data + Auth",
    note: "Better Auth secures identity while PostgreSQL stores the operational system of record.",
    items: ["email/password auth", "profiles", "agents", "calls"],
  },
  {
    title: "Voice Runtime",
    note: "Telephony and conversation infrastructure route every call through the AI stack.",
    items: ["Twilio inbound calls", "Retell AI dialogue", "ElevenLabs voice output"],
  },
  {
    title: "Automation",
    note: "Edge functions and event ingestion connect calls to future workflows.",
    items: ["summaries", "transfers", "knowledge base", "CRM hooks"],
  },
];

export const mvpTimeline: TimelineItem[] = [
  {
    label: "Week 1",
    focus: "Authentication + database setup",
    detail: "Ship Better Auth, create the base schema, and wire the user dashboard shell.",
  },
  {
    label: "Week 2",
    focus: "AI agent creation + Retell setup",
    detail: "Add the core agent form and start the first conversation engine integration.",
  },
  {
    label: "Week 3",
    focus: "Twilio inbound calls + voice delivery",
    detail: "Connect inbound telephony and finalize the voice handoff into ElevenLabs.",
  },
  {
    label: "Week 4",
    focus: "Call logging + dashboard metrics",
    detail: "Persist call records, surface transcripts, and close the MVP loop with reporting.",
  },
];

export const roadmapPhases: RoadmapPhase[] = [
  {
    title: "Phase 1 - Core AI Phone Agent",
    goal: "Validate that an AI assistant can answer a business call and push the interaction into a usable dashboard.",
    duration: "4 weeks",
    outcomes: [
      "Authentication and business account setup",
      "Simple AI agent creation",
      "Inbound call handling with logging",
      "Dashboard metrics and transcript history",
    ],
  },
  {
    title: "Phase 2 - Business Automation Layer",
    goal: "Make the assistant valuable in real operations with knowledge, transfers, and summaries.",
    duration: "3 to 4 weeks",
    outcomes: [
      "Knowledge base upload for FAQs and policies",
      "Human transfer routing",
      "Voicemail detection and spam screening",
      "Automatic call summaries and resolution status",
    ],
  },
  {
    title: "Phase 3 - Automation & Integrations",
    goal: "Turn the agent into an assistant that books work, qualifies leads, and syncs external systems.",
    duration: "Next growth cycle",
    outcomes: [
      "Appointment scheduling",
      "CRM integrations",
      "Lead qualification",
      "Mobile visibility for owners",
    ],
  },
  {
    title: "Phase 4 - Platform & Ecosystem",
    goal: "Evolve VoiceFlowOS from a product into the platform layer for AI phone operations.",
    duration: "Long-term expansion",
    outcomes: [
      "Agent marketplace",
      "Advanced analytics and performance scoring",
      "Multi-agent routing",
      "Training loops and multi-language support",
    ],
  },
];

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$29 / month",
    description: "For small businesses proving the first AI phone workflow.",
    allowance: "1 agent / 200 call minutes",
  },
  {
    name: "Pro",
    price: "$99 / month",
    description: "For teams handling multiple departments and higher daily volume.",
    allowance: "5 agents / 1000 call minutes",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For larger operations with custom routing, integrations, and governance needs.",
    allowance: "Custom limits / custom onboarding",
  },
];

export const riskItems: RiskItem[] = [
  {
    title: "Latency",
    mitigation: "Keep prompts tight, cache configuration lookups, and monitor end-to-end response time.",
  },
  {
    title: "Voice interruptions",
    mitigation: "Tune turn-taking and interruption thresholds before expanding to heavier workflows.",
  },
  {
    title: "Telephony reliability",
    mitigation: "Add call event monitoring, retries, and alerting around webhook failures.",
  },
  {
    title: "Cost per minute",
    mitigation: "Track spend per call path and optimize prompts before scaling traffic.",
  },
];

export const agents: Agent[] = [
  {
    id: "agent_1",
    name: "Northstar Receptionist",
    voice: "ElevenLabs / Maya",
    phoneNumber: "+1 (415) 555-0142",
    instructions:
      "You are a restaurant receptionist. Answer customer questions, take reservations, and politely escalate when a manager is requested.",
    specialty: "Reservations + business FAQs",
    status: "active",
    callsHandled: "126",
    resolutionRate: "84%",
  },
  {
    id: "agent_2",
    name: "BlueHarbor Intake",
    voice: "ElevenLabs / Marcus",
    phoneNumber: "+1 (628) 555-0198",
    instructions:
      "You are a home services intake assistant. Ask about the issue, timeline, and service area, then capture the lead cleanly.",
    specialty: "Lead capture + qualification",
    status: "active",
    callsHandled: "92",
    resolutionRate: "79%",
  },
  {
    id: "agent_3",
    name: "After Hours Desk",
    voice: "ElevenLabs / Nina",
    phoneNumber: "+1 (510) 555-0114",
    instructions:
      "You are an after-hours front desk assistant. Reassure callers, gather details, and summarize the request for the team.",
    specialty: "After-hours overflow",
    status: "draft",
    callsHandled: "12",
    resolutionRate: "68%",
  },
];

export const callLogs: CallLog[] = [
  {
    id: "call_401",
    caller: "+1 (628) 555-0122",
    agent: "Northstar Receptionist",
    duration: "06:18",
    timestamp: "Today / 11:24 AM",
    summary: "Caller asked about dinner availability, then booked a table for four on Tuesday at 7 PM.",
    status: "resolved",
  },
  {
    id: "call_398",
    caller: "+1 (415) 555-0186",
    agent: "BlueHarbor Intake",
    duration: "03:42",
    timestamp: "Today / 10:03 AM",
    summary: "Caller described a leaking pipe, shared location and budget, and requested a technician callback.",
    status: "transferred",
  },
  {
    id: "call_392",
    caller: "+1 (510) 555-0174",
    agent: "After Hours Desk",
    duration: "01:09",
    timestamp: "Today / 8:17 AM",
    summary: "Voicemail greeting detected quickly, so the agent exited and logged the attempt without continuing.",
    status: "voicemail",
  },
  {
    id: "call_387",
    caller: "+1 (650) 555-0140",
    agent: "Northstar Receptionist",
    duration: "00:21",
    timestamp: "Yesterday / 5:48 PM",
    summary: "Press-1 screening blocked a low-quality robocall before the AI engaged the caller.",
    status: "screened",
  },
];
