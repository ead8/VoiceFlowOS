import { z } from "zod";

import { getDb } from "@/lib/db/pool";
import type { KnowledgeDocumentRecord } from "@/types/app";

const optionalUrl = z.string().trim().url("Enter a valid URL.").optional().or(z.literal(""));

export const createKnowledgeDocumentSchema = z
  .object({
    title: z.string().trim().min(2, "Title is required."),
    sourceType: z.enum(["pdf", "text", "faq"]),
    content: z.string().trim().optional().or(z.literal("")),
    sourceUrl: optionalUrl,
    agentId: z.string().trim().optional().or(z.literal("")),
    status: z.enum(["processing", "ready", "failed"]).default("ready"),
  })
  .superRefine((input, ctx) => {
    if ((input.sourceType === "text" || input.sourceType === "faq") && !input.content) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "Add the knowledge content for text or FAQ entries.",
      });
    }

    if (input.sourceType === "pdf" && !input.sourceUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sourceUrl"],
        message: "Add the hosted PDF URL so Retell can ingest it later.",
      });
    }
  });

export type CreateKnowledgeDocumentInput = z.infer<typeof createKnowledgeDocumentSchema>;

type KnowledgeDocumentRow = {
  id: string;
  user_id: string;
  agent_id: string | null;
  title: string;
  source_type: KnowledgeDocumentRecord["sourceType"];
  content: string | null;
  source_url: string | null;
  status: KnowledgeDocumentRecord["status"];
  created_at: string;
  updated_at: string;
};

function mapKnowledgeDocument(row: KnowledgeDocumentRow): KnowledgeDocumentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    agentId: row.agent_id,
    title: row.title,
    sourceType: row.source_type,
    content: row.content,
    sourceUrl: row.source_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listKnowledgeDocumentsByUser(userId: string) {
  const db = getDb();
  const result = await db.query<KnowledgeDocumentRow>(
    `
      select
        id,
        user_id,
        agent_id,
        title,
        source_type,
        content,
        source_url,
        status,
        created_at,
        updated_at
      from knowledge_documents
      where user_id = $1
      order by updated_at desc, created_at desc
    `,
    [userId],
  );

  return result.rows.map(mapKnowledgeDocument);
}

export async function createKnowledgeDocument(userId: string, input: CreateKnowledgeDocumentInput) {
  const parsed = createKnowledgeDocumentSchema.parse(input);
  const db = getDb();

  const result = await db.query<KnowledgeDocumentRow>(
    `
      insert into knowledge_documents (
        user_id,
        agent_id,
        title,
        source_type,
        content,
        source_url,
        status
      )
      values ($1, nullif($2, '')::uuid, $3, $4, nullif($5, ''), nullif($6, ''), $7)
      returning
        id,
        user_id,
        agent_id,
        title,
        source_type,
        content,
        source_url,
        status,
        created_at,
        updated_at
    `,
    [
      userId,
      parsed.agentId ?? "",
      parsed.title,
      parsed.sourceType,
      parsed.content ?? "",
      parsed.sourceUrl ?? "",
      parsed.status,
    ],
  );

  return mapKnowledgeDocument(result.rows[0]);
}
