import { webAuth, adminAuth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

async function createAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@gmail.com';
  const password = process.env.ADMIN_SEED_PASSWORD || '12345678';
  const name = 'Admin User';

  console.log(`🔧 Ensuring admin user exists: ${email}`);

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log(`ℹ️ User ${email} already exists. Updating role to "admin"...`);
      await prisma.user.update({
        where: { email },
        data: { role: 'admin' },
      });
      console.log(`✅ User ${email} is now an admin.`);
      return;
    }

    // Create admin via Better-Auth
    const res = await (adminAuth.api as any).signUpEmail({
      body: {
        email,
        password,
        name,
        role: 'admin',
      },
    });

    console.log(`✅ Successfully created admin user:`, email);
  } catch (err: any) {
    console.error(`❌ Error creating admin user:`, err?.message || err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

createAdmin();
