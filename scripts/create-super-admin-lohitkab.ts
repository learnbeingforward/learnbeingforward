/**
 * One-time super-admin account creation, run via deploy-setup.ts. Idempotent:
 * does nothing if the account already exists, safe to leave in the deploy
 * chain. Only the bcrypt hash is committed here, never the plaintext password
 * — same as every other password in this app — the plaintext was given to
 * the account owner directly and never written to disk or git history.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EMAIL = "lohitkab@gmail.com";
const NAME = "Lohit Kumar";
const PASSWORD_HASH = "$2b$10$.t3a2QwUGC1wH34MEjWGMurWU4XUVGMLkeC8lVUKb1KvmNMEsrRNC";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log(`skip (exists): ${EMAIL}`);
    return;
  }

  await prisma.user.create({
    data: {
      name: NAME,
      email: EMAIL,
      passwordHash: PASSWORD_HASH,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`created SUPER_ADMIN account: ${EMAIL}`);
}

main()
  .catch((err) => {
    console.error("create-super-admin-lohitkab failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
