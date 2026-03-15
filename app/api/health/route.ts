import { NextResponse } from "next/server";

import {
  hasBillingConfig,
  hasBetterAuthConfig,
  hasTelephonyConfig,
  hasVoiceRoutingConfig,
  missingBillingEnv,
  missingBetterAuthEnv,
  missingVoiceEnv,
} from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    auth: {
      configured: hasBetterAuthConfig(),
      missing: missingBetterAuthEnv(),
    },
    billing: {
      configured: hasBillingConfig(),
      missing: missingBillingEnv(),
    },
    telephony: {
      configured: hasTelephonyConfig(),
    },
    voiceRouting: {
      configured: hasVoiceRoutingConfig(),
      missing: missingVoiceEnv(),
    },
  });
}
