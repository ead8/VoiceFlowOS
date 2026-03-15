import { getDb } from "@/lib/db/pool";
import type { AnalyticsOverview } from "@/types/app";

type AnalyticsRow = {
  total_calls: string;
  transferred_calls: string;
  voicemail_calls: string;
  spam_calls: string;
  completed_calls: string;
  average_duration_seconds: string;
};

type LeadRow = {
  total_leads: string;
  high_value_leads: string;
};

type AppointmentRow = {
  scheduled_appointments: string;
};

export async function getAnalyticsOverview(userId: string): Promise<AnalyticsOverview> {
  const db = getDb();

  const [callsResult, leadsResult, appointmentsResult] = await Promise.all([
    db.query<AnalyticsRow>(
      `
        select
          count(*)::text as total_calls,
          count(*) filter (where calls.resolution_status = 'transferred')::text as transferred_calls,
          count(*) filter (where calls.resolution_status = 'voicemail')::text as voicemail_calls,
          count(*) filter (where calls.resolution_status = 'spam')::text as spam_calls,
          count(*) filter (where calls.resolution_status = 'completed')::text as completed_calls,
          coalesce(avg(calls.duration_seconds), 0)::text as average_duration_seconds
        from calls
        inner join agents on agents.id = calls.agent_id
        where agents.user_id = $1
      `,
      [userId],
    ),
    db.query<LeadRow>(
      `
        select
          count(*)::text as total_leads,
          count(*) filter (where qualification = 'high')::text as high_value_leads
        from leads
        where user_id = $1
      `,
      [userId],
    ),
    db.query<AppointmentRow>(
      `
        select
          count(*) filter (where status = 'scheduled')::text as scheduled_appointments
        from appointments
        where user_id = $1
      `,
      [userId],
    ),
  ]);

  const calls = callsResult.rows[0];
  const leads = leadsResult.rows[0];
  const appointments = appointmentsResult.rows[0];

  return {
    totalCalls: Number(calls?.total_calls ?? "0"),
    transferredCalls: Number(calls?.transferred_calls ?? "0"),
    voicemailCalls: Number(calls?.voicemail_calls ?? "0"),
    spamCalls: Number(calls?.spam_calls ?? "0"),
    completedCalls: Number(calls?.completed_calls ?? "0"),
    totalLeads: Number(leads?.total_leads ?? "0"),
    highValueLeads: Number(leads?.high_value_leads ?? "0"),
    scheduledAppointments: Number(appointments?.scheduled_appointments ?? "0"),
    averageDurationSeconds: Math.round(Number(calls?.average_duration_seconds ?? "0")),
  };
}
