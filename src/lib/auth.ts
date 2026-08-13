import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db/client";
import { users, session, account, verification } from "@/db/schema";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: users, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(
        user.email,
        "Reset hasła — KlimaTech Serwis",
        `<p>Kliknij, aby ustawić nowe hasło: <a href="${url}">${url}</a></p><p>Jeśli to nie Ty, zignoruj tę wiadomość.</p>`,
      );
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true },
      tenantId: { type: "string", required: true },
      firstName: { type: "string", required: true },
      lastName: { type: "string", required: true },
      phone: { type: "string", required: false },
      certNumber: { type: "string", required: false },
    },
  },
  // tanstackStartCookies() must be last — it needs to see cookies set by other plugins.
  plugins: [tanstackStartCookies()],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

export type Role = "owner" | "technician" | "client";
