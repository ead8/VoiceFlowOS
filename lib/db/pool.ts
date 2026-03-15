import { Pool } from "pg";

import { env } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var __voiceflowPool: Pool | undefined;
}

export function getDb() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to access the VoiceFlowOS database.");
  }

  if (!globalThis.__voiceflowPool) {
    globalThis.__voiceflowPool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    });
  }

  return globalThis.__voiceflowPool;
}

