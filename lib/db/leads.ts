import { z } from "zod";

import { getDb } from "@/lib/db/pool";
import type { LeadRecord } from "@/types/app";

const optionalString = z.string().trim().optional().or(z.literal(""));

export const createLeadSchema = z.object({
  name: optionalString,
  phoneNumber: optionalString,
  budget: optionalString,
  timeline: optionalString,
  problem: optionalString,
  location: optionalString,
  qualification: z.enum(["high", "medium", "low"]).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

type LeadRow = {
  id: string;
  user_id: string;
  call_id: string | null;
  name: string | null;
  phone_number: string | null;
  budget: string | null;
  timeline: string | null;
  problem: string | null;
  location: string | null;
  qualification: LeadRecord["qualification"];
  created_at: string;
};

function mapLead(row: LeadRow): LeadRecord {
  return {
    id: row.id,
    userId: row.user_id,
    callId: row.call_id,
    name: row.name,
    phoneNumber: row.phone_number,
    budget: row.budget,
    timeline: row.timeline,
    problem: row.problem,
    location: row.location,
    qualification: row.qualification,
    createdAt: row.created_at,
  };
}

export async function listLeadsByUser(userId: string) {
  const db = getDb();
  const result = await db.query<LeadRow>(
    `
      select
        id,
        user_id,
        call_id,
        name,
        phone_number,
        budget,
        timeline,
        problem,
        location,
        qualification,
        created_at
      from leads
      where user_id = $1
      order by created_at desc
    `,
    [userId],
  );

  return result.rows.map(mapLead);
}

export async function createLead(userId: string, input: CreateLeadInput) {
  const parsed = createLeadSchema.parse(input);
  const db = getDb();

  const result = await db.query<LeadRow>(
    `
      insert into leads (
        user_id,
        name,
        phone_number,
        budget,
        timeline,
        problem,
        location,
        qualification
      )
      values (
        $1,
        nullif($2, ''),
        nullif($3, ''),
        nullif($4, ''),
        nullif($5, ''),
        nullif($6, ''),
        nullif($7, ''),
        $8
      )
      returning
        id,
        user_id,
        call_id,
        name,
        phone_number,
        budget,
        timeline,
        problem,
        location,
        qualification,
        created_at
    `,
    [
      userId,
      parsed.name ?? "",
      parsed.phoneNumber ?? "",
      parsed.budget ?? "",
      parsed.timeline ?? "",
      parsed.problem ?? "",
      parsed.location ?? "",
      parsed.qualification ?? null,
    ],
  );

  return mapLead(result.rows[0]);
}
