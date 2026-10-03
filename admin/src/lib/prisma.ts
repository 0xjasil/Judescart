import { PrismaClient } from '@prisma/client';

const rawDbUrl =
  process.env.CLUSTER_URL ||
  process.env.STORAGE_MONGODB_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

const formattedDbUrl = rawDbUrl
  ? rawDbUrl.includes('.mongodb.net/?')
    ? rawDbUrl.replace('.mongodb.net/?', '.mongodb.net/judescart?')
    : rawDbUrl
  : undefined;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    formattedDbUrl
      ? {
          datasources: {
            db: {
              url: formattedDbUrl,
            },
          },
        }
      : undefined
  );

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

