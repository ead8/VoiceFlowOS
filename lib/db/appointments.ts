import { z } from "zod";

import { getDb } from "@/lib/db/pool";
import type { AppointmentRecord } from "@/types/app";

const optionalString = z.string().trim().optional().or(z.literal(""));

export const createAppointmentSchema = z.object({
  agentId: optionalString,
  provider: z.string().trim().min(2, "Provider is required."),
  externalEventId: optionalString,
  contactName: optionalString,
  contactPhone: optionalString,
  scheduledFor: z.string().datetime({ offset: true }),
  notes: optionalString,
  status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

type AppointmentRow = {
  id: string;
  user_id: string;
  agent_id: string | null;
  agent_name: string | null;
  call_id: string | null;
  provider: string;
  external_event_id: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  scheduled_for: string;
  notes: string | null;
  status: AppointmentRecord["status"];
  created_at: string;
  updated_at: string;
};

function mapAppointment(row: AppointmentRow): AppointmentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    agentId: row.agent_id,
    agentName: row.agent_name,
    callId: row.call_id,
    provider: row.provider,
    externalEventId: row.external_event_id,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    scheduledFor: row.scheduled_for,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listAppointmentsByUser(userId: string) {
  const db = getDb();
  const result = await db.query<AppointmentRow>(
    `
      select
        appointments.id,
        appointments.user_id,
        appointments.agent_id,
        agents.name as agent_name,
        appointments.call_id,
        appointments.provider,
        appointments.external_event_id,
        appointments.contact_name,
        appointments.contact_phone,
        appointments.scheduled_for,
        appointments.notes,
        appointments.status,
        appointments.created_at,
        appointments.updated_at
      from appointments
      left join agents on agents.id = appointments.agent_id
      where appointments.user_id = $1
      order by appointments.scheduled_for asc
    `,
    [userId],
  );

  return result.rows.map(mapAppointment);
}

export async function createAppointment(userId: string, input: CreateAppointmentInput) {
  const parsed = createAppointmentSchema.parse(input);
  const db = getDb();

  const result = await db.query<AppointmentRow>(
    `
      insert into appointments (
        user_id,
        agent_id,
        provider,
        external_event_id,
        contact_name,
        contact_phone,
        scheduled_for,
        notes,
        status
      )
      values (
        $1,
        nullif($2, '')::uuid,
        $3,
        nullif($4, ''),
        nullif($5, ''),
        nullif($6, ''),
        $7::timestamptz,
        nullif($8, ''),
        $9
      )
      returning
        appointments.id,
        appointments.user_id,
        appointments.agent_id,
        null::text as agent_name,
        appointments.call_id,
        appointments.provider,
        appointments.external_event_id,
        appointments.contact_name,
        appointments.contact_phone,
        appointments.scheduled_for,
        appointments.notes,
        appointments.status,
        appointments.created_at,
        appointments.updated_at
    `,
    [
      userId,
      parsed.agentId ?? "",
      parsed.provider,
      parsed.externalEventId ?? "",
      parsed.contactName ?? "",
      parsed.contactPhone ?? "",
      parsed.scheduledFor,
      parsed.notes ?? "",
      parsed.status,
    ],
  );

  return mapAppointment(result.rows[0]);
}
