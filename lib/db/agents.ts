import { z } from "zod";

import { getDb } from "@/lib/db/pool";
import type { AgentRecord } from "@/types/app";

const phoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\+\d{8,15}$/, "Use E.164 format, for example +14155550123.");

export const createAgentSchema = z.object({
  name: z.string().trim().min(2, "Agent name is required."),
  instructions: z.string().trim().min(20, "Add clear instructions for the agent."),
  voice: z.string().trim().min(2, "Choose a voice label."),
  phoneNumber: phoneNumberSchema,
  status: z.enum(["draft", "active", "paused"]),
  retellAgentId: z.string().trim().min(1).optional().or(z.literal("")),
  retellPhoneNumber: phoneNumberSchema.optional().or(z.literal("")),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;

type AgentRow = {
  id: string;
  user_id: string;
  name: string;
  voice: string;
  instructions: string;
  phone_number: string;
  status: AgentRecord["status"];
  retell_agent_id: string | null;
  retell_phone_number: string | null;
  created_at: string;
  updated_at: string;
};

function mapAgent(row: AgentRow): AgentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    voice: row.voice,
    instructions: row.instructions,
    phoneNumber: row.phone_number,
    status: row.status,
    retellAgentId: row.retell_agent_id,
    retellPhoneNumber: row.retell_phone_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listAgentsByUser(userId: string): Promise<AgentRecord[]> {
  const db = getDb();
  const result = await db.query<AgentRow>(
    `
      select
        id,
        user_id,
        name,
        voice,
        instructions,
        phone_number,
        status,
        retell_agent_id,
        retell_phone_number,
        created_at,
        updated_at
      from agents
      where user_id = $1
      order by created_at desc
    `,
    [userId],
  );

  return result.rows.map(mapAgent);
}

export async function countAgentsByUser(userId: string): Promise<number> {
  const db = getDb();
  const result = await db.query<{ count: string }>(
    `
      select count(*)::text as count
      from agents
      where user_id = $1
    `,
    [userId],
  );

  return Number(result.rows[0]?.count ?? "0");
}

export async function createAgent(userId: string, input: CreateAgentInput): Promise<AgentRecord> {
  const parsed = createAgentSchema.parse(input);
  const db = getDb();

  const result = await db.query<AgentRow>(
    `
      insert into agents (
        user_id,
        name,
        voice,
        instructions,
        phone_number,
        status,
        retell_agent_id,
        retell_phone_number
      )
      values ($1, $2, $3, $4, $5, $6, nullif($7, ''), nullif($8, ''))
      returning
        id,
        user_id,
        name,
        voice,
        instructions,
        phone_number,
        status,
        retell_agent_id,
        retell_phone_number,
        created_at,
        updated_at
    `,
    [
      userId,
      parsed.name,
      parsed.voice,
      parsed.instructions,
      parsed.phoneNumber,
      parsed.status,
      parsed.retellAgentId ?? "",
      parsed.retellPhoneNumber ?? "",
    ],
  );

  return mapAgent(result.rows[0]);
}

export async function getAgentByInboundNumber(phoneNumber: string): Promise<AgentRecord | null> {
  const db = getDb();
  const result = await db.query<AgentRow>(
    `
      select
        id,
        user_id,
        name,
        voice,
        instructions,
        phone_number,
        status,
        retell_agent_id,
        retell_phone_number,
        created_at,
        updated_at
      from agents
      where phone_number = $1
      limit 1
    `,
    [phoneNumber],
  );

  return result.rows[0] ? mapAgent(result.rows[0]) : null;
}

export async function getAgentByRetellAgentId(retellAgentId: string): Promise<AgentRecord | null> {
  const db = getDb();
  const result = await db.query<AgentRow>(
    `
      select
        id,
        user_id,
        name,
        voice,
        instructions,
        phone_number,
        status,
        retell_agent_id,
        retell_phone_number,
        created_at,
        updated_at
      from agents
      where retell_agent_id = $1
      limit 1
    `,
    [retellAgentId],
  );

  return result.rows[0] ? mapAgent(result.rows[0]) : null;
}
