import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { adapter } from "./prisma.js";
import { config } from "../config/index.js";
import { PrismaClient } from "../../generated/prisma/client.js";

const prisma = new PrismaClient({ adapter });
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: { enabled: true },
  emailVerification: {
    sendOnSignIn: true,
  },
  trustedOrigins: [config.FRONTEND_URL],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
