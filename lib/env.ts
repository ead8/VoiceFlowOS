import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: optionalString,
  BETTER_AUTH_SECRET: optionalString,
  BETTER_AUTH_URL: optionalString,
  NEXT_PUBLIC_SITE_URL: optionalString,
  TWILIO_ACCOUNT_SID: optionalString,
  TWILIO_AUTH_TOKEN: optionalString,
  TWILIO_PHONE_NUMBER: optionalString,
  RETELL_API_KEY: optionalString,
  RETELL_TRANSFER_NUMBER: optionalString,
  RETELL_WEBHOOK_SECRET: optionalString,
  ELEVENLABS_API_KEY: optionalString,
  BUSINESS_FORWARD_NUMBER: optionalString,
  ENABLE_PRESS_ONE_SCREENING: z.enum(["true", "false"]).optional(),
  POLAR_ACCESS_TOKEN: optionalString,
  POLAR_SERVER: z.enum(["sandbox", "production"]).optional(),
  POLAR_API_BASE_URL: optionalString,
  POLAR_STARTER_PRODUCT_ID: optionalString,
  POLAR_PRO_PRODUCT_ID: optionalString,
  POLAR_MINUTES_METER_ID: optionalString,
  POLAR_WEBHOOK_SECRET: optionalString,
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  RETELL_API_KEY: process.env.RETELL_API_KEY,
  RETELL_TRANSFER_NUMBER: process.env.RETELL_TRANSFER_NUMBER,
  RETELL_WEBHOOK_SECRET: process.env.RETELL_WEBHOOK_SECRET,
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  BUSINESS_FORWARD_NUMBER: process.env.BUSINESS_FORWARD_NUMBER,
  ENABLE_PRESS_ONE_SCREENING: process.env.ENABLE_PRESS_ONE_SCREENING,
  POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
  POLAR_SERVER: process.env.POLAR_SERVER as "sandbox" | "production" | undefined,
  POLAR_API_BASE_URL: process.env.POLAR_API_BASE_URL,
  POLAR_STARTER_PRODUCT_ID: process.env.POLAR_STARTER_PRODUCT_ID,
  POLAR_PRO_PRODUCT_ID: process.env.POLAR_PRO_PRODUCT_ID,
  POLAR_MINUTES_METER_ID: process.env.POLAR_MINUTES_METER_ID,
  POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
});

const betterAuthEnvKeys = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"] as const;
const voiceEnvKeys = ["TWILIO_AUTH_TOKEN", "RETELL_TRANSFER_NUMBER", "RETELL_API_KEY"] as const;
const billingEnvKeys = ["POLAR_ACCESS_TOKEN", "POLAR_STARTER_PRODUCT_ID", "POLAR_PRO_PRODUCT_ID"] as const;

type EnvKey = keyof typeof env;

export function getAppUrl() {
  return env.NEXT_PUBLIC_SITE_URL ?? env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

export function getPolarApiBaseUrl() {
  return env.POLAR_API_BASE_URL ?? "https://sandbox-api.polar.sh";
}

export function missingEnv(keys: readonly EnvKey[]) {
  return keys.filter((key) => !env[key]);
}

export function missingBetterAuthEnv() {
  return missingEnv(betterAuthEnvKeys);
}

export function hasBetterAuthConfig() {
  return missingBetterAuthEnv().length === 0;
}

export function missingVoiceEnv() {
  return missingEnv(voiceEnvKeys);
}

export function hasVoiceRoutingConfig() {
  return missingVoiceEnv().length === 0;
}

export function hasTelephonyConfig() {
  return Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN);
}

export function missingBillingEnv() {
  return missingEnv(billingEnvKeys);
}

export function hasBillingConfig() {
  return missingBillingEnv().length === 0;
}

export function hasMinuteMeterConfig() {
  return Boolean(env.POLAR_MINUTES_METER_ID);
}

export function isPressOneScreeningEnabled() {
  return env.ENABLE_PRESS_ONE_SCREENING === "true";
}

export function getWebhookUrl(pathname: string) {
  return new URL(pathname, getAppUrl()).toString();
}
