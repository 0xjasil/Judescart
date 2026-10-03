import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { prisma } from "./prisma.js";

const localPorts = Array.from({ length: 11 }, (_, i) => 3000 + i);
const defaultLocalOrigins = [
  ...localPorts.map((p) => `http://localhost:${p}`),
  ...localPorts.map((p) => `http://127.0.0.1:${p}`),
];

const defaultOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  process.env.NEXT_PUBLIC_ADMIN_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  "https://judescart-admin.vercel.app",
  "https://judescart-ammi.vercel.app",
  "https://judescart-feg8.vercel.app",
  "https://judescart-six.vercel.app",
  ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(",").map((s) => s.trim()) : []),
  ...defaultLocalOrigins,
].filter(Boolean) as string[];

const getTrustedOrigins = (request?: any) => {
  const origins = [...defaultOrigins];
  try {
    const origin =
      typeof request?.headers?.get === "function"
        ? request.headers.get("origin")
        : request?.headers?.origin;
    if (origin) {
      const url = new URL(origin);
      if (
        url.hostname.endsWith(".vercel.app") ||
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1"
      ) {
        if (!origins.includes(origin)) {
          origins.push(origin);
        }
      }
    }
  } catch {
    // ignore
  }
  return origins;
};

const commonConfig = {
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),

  trustedOrigins: getTrustedOrigins,

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