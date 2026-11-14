/**
 * One-time migration, run via deploy-setup.ts: updates the live company
 * contact email from the old info@ address to support@, but only if it's
 * still set to that original default — never overwrites a value the admin
 * has since changed themselves via Edit Site -> Company Contact.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OLD_EMAIL = "info@learnbeingforward.in";
const NEW_EMAIL = "support@learnbeingforward.in";

async function main() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!settings || settings.companyContactEmail !== OLD_EMAIL) {
    console.log(`skip: companyContactEmail is already "${settings?.companyContactEmail ?? "(unset)"}"`);
    return;
  }

  await prisma.siteSettings.update({
    where: { id: "singleton" },
    data: { companyContactEmail: NEW_EMAIL },
  });
  console.log(`updated companyContactEmail: ${OLD_EMAIL} -> ${NEW_EMAIL}`);
}

main()
  .catch((err) => {
    console.error("update-contact-email failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
