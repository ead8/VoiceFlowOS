import { getDb } from "@/lib/db/pool";
import type { CallLifecycleStatus, CallRecord, CallResolutionStatus, DashboardMetrics } from "@/types/app";

type CallRow = {
  id: string;
  external_call_id: string | null;
  agent_id: string;
  agent_name: string;
  caller_number: string;
  duration_seconds: number;
  transcript: string | null;
  summary: string | null;
  resolution_status: CallResolutionStatus;
  status: CallLifecycleStatus;
  recording_url: string | null;
  created_at: string;
};

type MetricsRow = {
  calls_today: string;
  calls_this_week: string;
  average_duration_seconds: string;
};

type UsageRow = {
  total_duration_seconds: string;
  total_calls: string;
};

type UpsertCallInput = {
  externalCallId: string;
  agentId: string;
  callerNumber: string;
  durationSeconds: number;
  transcript: string | null;
  summary: string | null;
  resolutionStatus: CallResolutionStatus;
  status: CallLifecycleStatus;
  recordingUrl: string | null;
  createdAt: string;
};

function mapCall(row: CallRow): CallRecord {
  return {
    id: row.id,
    externalCallId: row.external_call_id,
    agentId: row.agent_id,
    agentName: row.agent_name,
    callerNumber: row.caller_number,
    durationSeconds: row.duration_seconds,
    transcript: row.transcript,
    summary: row.summary,
    resolutionStatus: row.resolution_status,
    status: row.status,
    recordingUrl: row.recording_url,
    createdAt: row.created_at,
  };
}

export async function listCallsByUser(userId: string, limit = 20): Promise<CallRecord[]> {
  const db = getDb();
  const result = await db.query<CallRow>(
    `
      select
        calls.id,
        calls.external_call_id,
        calls.agent_id,
        agents.name as agent_name,
        calls.caller_number,
        calls.duration_seconds,
        calls.transcript,
        calls.summary,
        calls.resolution_status,
        calls.status,
        calls.recording_url,
        calls.created_at
      from calls
      inner join agents on agents.id = calls.agent_id
      where agents.user_id = $1
      order by calls.created_at desc
      limit $2
    `,
    [userId, limit],
  );

  return result.rows.map(mapCall);
}

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const db = getDb();
  const callsResult = await db.query<MetricsRow>(
    `
      select
        count(*) filter (where calls.created_at >= date_trunc('day', now()))::text as calls_today,
        count(*) filter (where calls.created_at >= date_trunc('week', now()))::text as calls_this_week,
        coalesce(avg(calls.duration_seconds), 0)::text as average_duration_seconds
      from calls
      inner join agents on agents.id = calls.agent_id
      where agents.user_id = $1
    `,
    [userId],
  );

  const agentsResult = await db.query<{ count: string }>(
    `
      select count(*)::text as count
      from agents
      where user_id = $1
    `,
    [userId],
  );

  const metrics = callsResult.rows[0];

  return {
    callsToday: Number(metrics?.calls_today ?? "0"),
    callsThisWeek: Number(metrics?.calls_this_week ?? "0"),
    averageDurationSeconds: Math.round(Number(metrics?.average_duration_seconds ?? "0")),
    totalAgents: Number(agentsResult.rows[0]?.count ?? "0"),
  };
}

export async function upsertCallFromRetell(input: UpsertCallInput) {
  const db = getDb();

  await db.query(
    `
      insert into calls (
        agent_id,
        external_call_id,
        caller_number,
        duration_seconds,
        transcript,
        summary,
        resolution_status,
        status,
        recording_url,
        created_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::timestamptz)
      on conflict (external_call_id)
      do update set
        duration_seconds = excluded.duration_seconds,
        transcript = excluded.transcript,
        summary = excluded.summary,
        resolution_status = excluded.resolution_status,
        status = excluded.status,
        recording_url = excluded.recording_url,
        created_at = excluded.created_at
    `,
    [
      input.agentId,
      input.externalCallId,
      input.callerNumber,
      input.durationSeconds,
      input.transcript,
      input.summary,
      input.resolutionStatus,
      input.status,
      input.recordingUrl,
      input.createdAt,
    ],
  );
}

export async function getUsageSummaryByUser(userId: string, startsAt: string, endsAt?: string) {
  const db = getDb();
  const values = endsAt ? [userId, startsAt, endsAt] : [userId, startsAt];
  const endClause = endsAt ? "and calls.created_at <= $3::timestamptz" : "";

  const result = await db.query<UsageRow>(
    `
      select
        coalesce(sum(calls.duration_seconds), 0)::text as total_duration_seconds,
        count(*)::text as total_calls
      from calls
      inner join agents on agents.id = calls.agent_id
      where agents.user_id = $1
        and calls.created_at >= $2::timestamptz
        ${endClause}
    `,
    values,
  );

  const row = result.rows[0];
  const totalDurationSeconds = Number(row?.total_duration_seconds ?? "0");

  return {
    totalCalls: Number(row?.total_calls ?? "0"),
    totalDurationSeconds,
    totalRoundedMinutes: Math.ceil(totalDurationSeconds / 60),
  };
}
