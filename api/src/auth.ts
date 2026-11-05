import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { prisma } from "./db.js";
import { env } from "./env.js";

export const auth = betterAuth({
  appName: "Khanya Nature School",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [env.WEB_ORIGIN],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "editor",
      adminRoles: ["admin"],
      roles: {
        admin: adminAc,
        editor: userAc,
      },
    }),
  ],
  advanced: {
    useSecureCookies: env.sessionCookieSecure,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.sessionCookieSecure,
      path: "/",
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
