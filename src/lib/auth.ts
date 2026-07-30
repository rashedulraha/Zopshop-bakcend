import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";

import { adapter } from "./prisma.js";
import { config } from "../config/index.js";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient({ adapter });
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustHost: true,

  user: {
    additionalFields: {
      role: {
        type: "string",
      },
      storeId: {
        type: "string",
        required: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => {
        const bcrypt = await import("bcryptjs");
        return bcrypt.hash(password, 10);
      },
      verify: async ({ password, hash }) => {
        const bcrypt = await import("bcryptjs");
        return bcrypt.compare(password, hash);
      },
    },
  },
  emailVerification: {
    sendOnSignIn: true,
  },
  trustedOrigins: [
    config.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter((url): url is string => Boolean(url)),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    twoFactor({
      issuer: "ZopShop",
    }),
  ],
});
