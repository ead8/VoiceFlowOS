import { z } from "zod";

import { getDb } from "@/lib/db/pool";
import type { BusinessProfileRecord } from "@/types/app";

const phoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\+\d{8,15}$/, "Use E.164 format, for example +14155550123.")
  .optional()
  .or(z.literal(""));

export const businessProfileSchema = z.object({
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  businessPhone: phoneNumberSchema,
  timezone: z.string().trim().min(2, "Timezone is required."),
  transferPhoneNumber: phoneNumberSchema,
  spamScreeningEnabled: z.boolean(),
  voicemailDetectionEnabled: z.boolean(),
  languages: z.array(z.string().trim().min(2)).min(1),
});

export type UpdateBusinessProfileInput = z.infer<typeof businessProfileSchema>;

type BusinessProfileRow = {
  user_id: string;
  company_name: string | null;
  plan: BusinessProfileRecord["plan"];
  industry: string | null;
  business_phone: string | null;
  timezone: string;
  transfer_phone_number: string | null;
  spam_screening_enabled: boolean;
  voicemail_detection_enabled: boolean;
  languages: string[] | null;
  created_at: string;
  updated_at: string;
};

function mapBusinessProfile(row: BusinessProfileRow): BusinessProfileRecord {
  return {
    userId: row.user_id,
    companyName: row.company_name,
    plan: row.plan,
    industry: row.industry,
    businessPhone: row.business_phone,
    timezone: row.timezone,
    transferPhoneNumber: row.transfer_phone_number,
    spamScreeningEnabled: row.spam_screening_enabled,
    voicemailDetectionEnabled: row.voicemail_detection_enabled,
    languages: row.languages ?? ["English"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getBusinessProfileByUser(userId: string): Promise<BusinessProfileRecord | null> {
  const db = getDb();
  const result = await db.query<BusinessProfileRow>(
    `
      select
        user_id,
        company_name,
        plan,
        industry,
        business_phone,
        timezone,
        transfer_phone_number,
        spam_screening_enabled,
        voicemail_detection_enabled,
        languages,
        created_at,
        updated_at
      from business_profiles
      where user_id = $1
      limit 1
    `,
    [userId],
  );

  return result.rows[0] ? mapBusinessProfile(result.rows[0]) : null;
}

export async function upsertBusinessProfile(userId: string, input: UpdateBusinessProfileInput) {
  const parsed = businessProfileSchema.parse(input);
  const db = getDb();

  const result = await db.query<BusinessProfileRow>(
    `
      insert into business_profiles (
        user_id,
        company_name,
        industry,
        business_phone,
        timezone,
        transfer_phone_number,
        spam_screening_enabled,
        voicemail_detection_enabled,
        languages
      )
      values (
        $1,
        nullif($2, ''),
        nullif($3, ''),
        nullif($4, ''),
        $5,
        nullif($6, ''),
        $7,
        $8,
        $9::text[]
      )
      on conflict (user_id)
      do update set
        company_name = excluded.company_name,
        industry = excluded.industry,
        business_phone = excluded.business_phone,
        timezone = excluded.timezone,
        transfer_phone_number = excluded.transfer_phone_number,
        spam_screening_enabled = excluded.spam_screening_enabled,
        voicemail_detection_enabled = excluded.voicemail_detection_enabled,
        languages = excluded.languages
      returning
        user_id,
        company_name,
        plan,
        industry,
        business_phone,
        timezone,
        transfer_phone_number,
        spam_screening_enabled,
        voicemail_detection_enabled,
        languages,
        created_at,
        updated_at
    `,
    [
      userId,
      parsed.companyName ?? "",
      parsed.industry ?? "",
      parsed.businessPhone ?? "",
      parsed.timezone,
      parsed.transferPhoneNumber ?? "",
      parsed.spamScreeningEnabled,
      parsed.voicemailDetectionEnabled,
      parsed.languages,
    ],
  );

  return mapBusinessProfile(result.rows[0]);
}
