import { checkout, polar, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { getDb } from "@/lib/db/pool";
import { env, getAppUrl, hasBetterAuthConfig } from "@/lib/env";

const polarClient = env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: env.POLAR_ACCESS_TOKEN,
      server: env.POLAR_SERVER,
      serverURL: env.POLAR_API_BASE_URL,
    })
  : null;

const checkoutProducts = [
  ...(env.POLAR_STARTER_PRODUCT_ID ? [{ productId: env.POLAR_STARTER_PRODUCT_ID, slug: "starter" as const }] : []),
  ...(env.POLAR_PRO_PRODUCT_ID ? [{ productId: env.POLAR_PRO_PRODUCT_ID, slug: "pro" as const }] : []),
];

const polarPlugins = polarClient
  ? [
      polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: checkoutProducts.length > 0 ? checkoutProducts : undefined,
            successUrl: "/dashboard/billing?checkout=success",
            returnUrl: `${getAppUrl()}/pricing`,
            authenticatedUsersOnly: true,
          }),
          portal({
            returnUrl: `${getAppUrl()}/dashboard/billing`,
          }),
          usage(),
          ...(env.POLAR_WEBHOOK_SECRET
            ? [
                webhooks({
                  secret: env.POLAR_WEBHOOK_SECRET,
                  onCustomerStateChanged: async () => {},
                }),
              ]
            : []),
        ],
      }),
    ]
  : [];

export const auth = hasBetterAuthConfig()
  ? betterAuth({
      database: getDb(),
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL,
      trustedOrigins: [getAppUrl()],
      plugins: [nextCookies(), ...polarPlugins],
      emailAndPassword: {
        enabled: true,
      },
    })
  : null;

export function requireAuth() {
  if (!auth) {
    throw new Error("Better Auth is not configured. Add DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL.");
  }

  return auth;
}
