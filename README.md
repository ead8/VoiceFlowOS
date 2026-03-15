# VoiceFlowOS

VoiceFlowOS is a production-grade starter for an AI phone agent platform. The repo now includes a real Better Auth integration path, PostgreSQL-backed agent and call records, provider webhook endpoints, and a dashboard that reads live data instead of hardcoded demo rows.

## Stack

- Next.js App Router
- Tailwind CSS
- Better Auth
- Polar billing
- PostgreSQL via `pg`
- Twilio webhook entrypoint
- Retell webhook sync

## Routes

- `/` - product homepage
- `/pricing` - public pricing and upgrade page
- `/login` - Better Auth sign-in
- `/signup` - Better Auth sign-up
- `/dashboard` - authenticated overview
- `/dashboard/agents` - agent management
- `/dashboard/agents/new` - create agent
- `/dashboard/knowledge` - business knowledge base
- `/dashboard/calls` - call history
- `/dashboard/leads` - lead qualification
- `/dashboard/appointments` - appointment workflow
- `/dashboard/analytics` - performance reporting
- `/dashboard/billing` - subscription access and minute usage
- `/dashboard/integrations` - provider status and webhook URLs
- `/dashboard/settings` - business profile and call policy
- `/api/auth/[...all]` - Better Auth handler
- `/api/webhooks/twilio/inbound` - Twilio inbound voice route
- `/api/webhooks/retell` - Retell webhook ingestion
- `/api/health` - deployment health endpoint

## Environment variables

Use [.env.example](/C:/Users/ebisa/Downloads/VoiceFlowOS/.env.example) as the starting point.

Required for auth:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

Required for billing:

- `POLAR_ACCESS_TOKEN`
- `POLAR_STARTER_PRODUCT_ID`
- `POLAR_PRO_PRODUCT_ID`

Optional for billing:

- `POLAR_SERVER`
- `POLAR_API_BASE_URL`
- `POLAR_MINUTES_METER_ID`
- `POLAR_WEBHOOK_SECRET`

Required for voice routing:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `RETELL_API_KEY`
- `RETELL_TRANSFER_NUMBER`

## Database

[supabase/schema.sql](/C:/Users/ebisa/Downloads/VoiceFlowOS/supabase/schema.sql) contains the VoiceFlowOS application tables for:

- business profiles
- agents
- calls
- knowledge documents
- integrations
- leads
- appointments

Better Auth manages its own core auth tables separately. Generate those against the same `DATABASE_URL`, then apply the VoiceFlowOS application schema.

## Local setup

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Key implementation files

- [lib/auth.ts](/C:/Users/ebisa/Downloads/VoiceFlowOS/lib/auth.ts) configures Better Auth.
- [lib/billing.ts](/C:/Users/ebisa/Downloads/VoiceFlowOS/lib/billing.ts) computes subscription access and workspace gating.
- [lib/polar.ts](/C:/Users/ebisa/Downloads/VoiceFlowOS/lib/polar.ts) initializes the Polar SDK and usage ingestion helper.
- [lib/session.ts](/C:/Users/ebisa/Downloads/VoiceFlowOS/lib/session.ts) performs secure server-side session reads.
- [lib/db/agents.ts](/C:/Users/ebisa/Downloads/VoiceFlowOS/lib/db/agents.ts) contains typed agent queries and creation logic.
- [lib/db/calls.ts](/C:/Users/ebisa/Downloads/VoiceFlowOS/lib/db/calls.ts) contains call queries and Retell upsert logic.
- [lib/db/business-profile.ts](/C:/Users/ebisa/Downloads/VoiceFlowOS/lib/db/business-profile.ts) stores business routing policy and profile settings.
- [lib/db/knowledge.ts](/C:/Users/ebisa/Downloads/VoiceFlowOS/lib/db/knowledge.ts) stores hosted PDFs, FAQs, and text knowledge.
- [lib/db/leads.ts](/C:/Users/ebisa/Downloads/VoiceFlowOS/lib/db/leads.ts) stores qualified lead records.
- [lib/db/appointments.ts](/C:/Users/ebisa/Downloads/VoiceFlowOS/lib/db/appointments.ts) stores appointment workflow data.
- [app/api/webhooks/twilio/inbound/route.ts](/C:/Users/ebisa/Downloads/VoiceFlowOS/app/api/webhooks/twilio/inbound/route.ts) validates inbound Twilio requests and returns TwiML.
- [app/api/webhooks/retell/route.ts](/C:/Users/ebisa/Downloads/VoiceFlowOS/app/api/webhooks/retell/route.ts) verifies Retell signatures and persists calls.

## Next steps

1. Run the Better Auth table generation or migration flow against `DATABASE_URL`.
2. Apply [supabase/schema.sql](/C:/Users/ebisa/Downloads/VoiceFlowOS/supabase/schema.sql).
3. Create Starter and Pro recurring products in Polar, then place their ids in `.env`.
4. Create an account through `/signup` and choose a plan from `/pricing` or `/dashboard/billing`.
5. Add an agent with an inbound number and Retell routing metadata.
6. Point Twilio and Retell webhooks at the URLs shown in `/dashboard/integrations`.
