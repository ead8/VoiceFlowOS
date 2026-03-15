import { verify as verifyRetellWebhook } from "retell-sdk/lib/webhook_auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAgentByRetellAgentId } from "@/lib/db/agents";
import { upsertCallFromRetell } from "@/lib/db/calls";
import { env } from "@/lib/env";
import { ingestPolarCallUsage } from "@/lib/polar";

export const runtime = "nodejs";

const retellCallSchema = z
  .object({
    call_id: z.string(),
    agent_id: z.string().optional(),
    from_number: z.string().optional(),
    duration_ms: z.number().optional(),
    transcript: z.string().nullable().optional(),
    call_status: z.enum(["registered", "not_connected", "ongoing", "ended", "error"]).optional(),
    disconnection_reason: z.string().optional(),
    recording_url: z.string().url().optional(),
    start_timestamp: z.number().optional(),
    end_timestamp: z.number().optional(),
    call_analysis: z
      .object({
        call_summary: z.string().optional(),
        in_voicemail: z.boolean().optional(),
      })
      .partial()
      .optional(),
  })
  .passthrough();

const retellWebhookSchema = z
  .object({
    event: z
      .enum([
        "call_started",
        "call_ended",
        "call_analyzed",
        "transcript_updated",
        "transfer_started",
        "transfer_bridged",
        "transfer_cancelled",
        "transfer_ended",
      ])
      .or(z.string()),
    call: retellCallSchema.optional(),
    data: z.any().optional(),
  })
  .passthrough();

function getCallPayload(payload: z.infer<typeof retellWebhookSchema>) {
  if (payload.call) {
    return payload.call;
  }

  if (payload.data && typeof payload.data === "object" && "call" in payload.data) {
    const candidate = (payload.data as { call?: unknown }).call;
    const parsed = retellCallSchema.safeParse(candidate);
    if (parsed.success) {
      return parsed.data;
    }
  }

  if (payload.data) {
    const parsed = retellCallSchema.safeParse(payload.data);
    if (parsed.success) {
      return parsed.data;
    }
  }

  return null;
}

function mapResolutionStatus(reason?: string, voicemail?: boolean) {
  if (voicemail || reason === "voicemail_reached") {
    return "voicemail" as const;
  }

  if (reason === "marked_as_spam" || reason === "scam_detected") {
    return "spam" as const;
  }

  if (reason === "call_transfer" || reason === "transfer_bridged" || reason === "transfer_cancelled") {
    return "transferred" as const;
  }

  if (reason?.startsWith("error_")) {
    return "failed" as const;
  }

  return "completed" as const;
}

function mapLifecycleStatus(callStatus?: string, reason?: string, voicemail?: boolean) {
  if (callStatus === "ongoing") {
    return "in_progress" as const;
  }

  if (voicemail || reason === "voicemail_reached") {
    return "voicemail" as const;
  }

  if (reason === "marked_as_spam" || reason === "scam_detected") {
    return "spam" as const;
  }

  if (callStatus === "error") {
    return "failed" as const;
  }

  return "completed" as const;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-retell-signature") ?? request.headers.get("x-signature") ?? request.headers.get("signature");

  if (!env.RETELL_API_KEY || !signature) {
    return NextResponse.json({ error: "Retell webhook verification is not configured." }, { status: 503 });
  }

  const valid = await verifyRetellWebhook(rawBody, env.RETELL_API_KEY, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid Retell signature." }, { status: 401 });
  }

  const payload = retellWebhookSchema.parse(JSON.parse(rawBody));
  const call = getCallPayload(payload);

  if (!call?.call_id || !call.agent_id) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const agent = await getAgentByRetellAgentId(call.agent_id);
  if (!agent) {
    return NextResponse.json({ ok: true, skipped: true, reason: "No VoiceFlowOS agent matches the Retell agent id." });
  }

  const voicemail = Boolean(call.call_analysis?.in_voicemail);
  const durationSeconds = Math.max(0, Math.round((call.duration_ms ?? 0) / 1000));
  const createdAt = call.start_timestamp ? new Date(call.start_timestamp).toISOString() : new Date().toISOString();

  await upsertCallFromRetell({
    externalCallId: call.call_id,
    agentId: agent.id,
    callerNumber: call.from_number ?? "Unknown",
    durationSeconds,
    transcript: call.transcript ?? null,
    summary: call.call_analysis?.call_summary ?? null,
    resolutionStatus: mapResolutionStatus(call.disconnection_reason, voicemail),
    status: mapLifecycleStatus(call.call_status, call.disconnection_reason, voicemail),
    recordingUrl: call.recording_url ?? null,
    createdAt,
  });

  if (payload.event === "call_ended" || payload.event === "call_analyzed") {
    await ingestPolarCallUsage({
      userId: agent.userId,
      callId: call.call_id,
      agentId: agent.id,
      durationSeconds,
      createdAt,
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}
