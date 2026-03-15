import twilio from "twilio";
import { NextResponse } from "next/server";

import { getBillingSummary, hasWorkspaceAccess } from "@/lib/billing";
import { getAgentByInboundNumber } from "@/lib/db/agents";
import {
  env,
  getWebhookUrl,
  hasTelephonyConfig,
  isPressOneScreeningEnabled,
} from "@/lib/env";

export const runtime = "nodejs";

function xmlResponse(body: string) {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/xml; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const voiceResponse = new twilio.twiml.VoiceResponse();

  if (!hasTelephonyConfig()) {
    voiceResponse.say("VoiceFlow O S telephony is not configured yet.");
    voiceResponse.hangup();
    return xmlResponse(voiceResponse.toString());
  }

  const formData = await request.formData();
  const fields = Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
  ) as Record<string, string>;

  const signature = request.headers.get("x-twilio-signature");
  if (signature && env.TWILIO_AUTH_TOKEN) {
    const valid = twilio.validateRequest(env.TWILIO_AUTH_TOKEN, signature, request.url, fields);
    if (!valid) {
      return new NextResponse("Invalid Twilio signature.", { status: 401 });
    }
  }

  const screeningEnabled = isPressOneScreeningEnabled();
  const digits = fields.Digits;

  if (screeningEnabled && !digits) {
    const gather = voiceResponse.gather({
      action: getWebhookUrl("/api/webhooks/twilio/inbound"),
      method: "POST",
      numDigits: 1,
      timeout: 5,
    });
    gather.say("Press 1 to connect to the A I assistant.");
    return xmlResponse(voiceResponse.toString());
  }

  if (screeningEnabled && digits !== "1") {
    voiceResponse.say("We could not verify your input. Goodbye.");
    voiceResponse.hangup();
    return xmlResponse(voiceResponse.toString());
  }

  const inboundNumber = fields.To ?? env.TWILIO_PHONE_NUMBER ?? "";
  let destination = env.RETELL_TRANSFER_NUMBER ?? null;
  let ownerUserId: string | null = null;

  if (inboundNumber) {
    try {
      const agent = await getAgentByInboundNumber(inboundNumber);
      destination = agent?.retellPhoneNumber ?? destination;
      ownerUserId = agent?.userId ?? null;
    } catch {
      // The app can still use the global Retell transfer number when database lookup is unavailable.
    }
  }

  if (ownerUserId) {
    try {
      const billing = await getBillingSummary(ownerUserId);

      if (!hasWorkspaceAccess(billing)) {
        voiceResponse.say(
          billing.status === "meter_exhausted"
            ? "This business has used its included call minutes for the current billing window."
            : "This business line is not available until billing is active.",
        );
        voiceResponse.hangup();
        return xmlResponse(voiceResponse.toString());
      }
    } catch {
      voiceResponse.say("Billing status could not be verified for this business line.");
      voiceResponse.hangup();
      return xmlResponse(voiceResponse.toString());
    }
  }

  if (!destination) {
    voiceResponse.say("No Retell transfer number is configured for this business line.");
    voiceResponse.hangup();
    return xmlResponse(voiceResponse.toString());
  }

  voiceResponse.dial(
    {
      answerOnBridge: true,
      callerId: fields.From,
    },
    destination,
  );

  return xmlResponse(voiceResponse.toString());
}
