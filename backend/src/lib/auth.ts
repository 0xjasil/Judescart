import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { prisma } from "./prisma.js";

const localPorts = Array.from({ length: 11 }, (_, i) => 3000 + i);
const defaultLocalOrigins = [
  ...localPorts.map((p) => `http://localhost:${p}`),
  ...localPorts.map((p) => `http://127.0.0.1:${p}`),
];

const trustedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  ...defaultLocalOrigins,
].filter(Boolean) as string[];

const commonConfig = {
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),

  trustedOrigins,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  user: {
    additionalFields: {
      role: {
        type: "string" as const,
        required: false,
        defaultValue: "user",
        input: true,
      },
      branch: {
        type: "string" as const,
        required: false,
        input: true,
      },
      phone: {
        type: "string" as const,
        required: false,
        input: true,
      },
    },
  },
};

export const webAuth = betterAuth({
  ...commonConfig,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  basePath: "/api/auth-web",
  advanced: {
    cookiePrefix: "stevejon-web",
  },
});

export const adminAuth = betterAuth({
  ...commonConfig,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  basePath: "/api/auth-admin",
  advanced: {
    cookiePrefix: "stevejon-admin",
  },
  plugins: [
    admin({
      adminRoles: ["admin"],
    }),
  ],
});