/**
 * Promote a user to ADMIN, or demote them back to USER.
 *
 * Usage:
 *   node scripts/make-admin.js your@email.com                 (promote to ADMIN)
 *   node scripts/make-admin.js your@email.com --role=USER     (demote to USER)
 *   node scripts/make-admin.js                                (uses the only user in the DB)
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const roleArg = process.argv.find((a) => a.startsWith("--role="));
  const role = roleArg ? roleArg.split("=")[1].toUpperCase() : "ADMIN";
  const email = process.argv[2];

  if (!["ADMIN", "USER"].includes(role)) {
    console.error(`Invalid role "${role}". Use --role=ADMIN or --role=USER.`);
    process.exitCode = 1;
    return;
  }

  const user = email
    ? await prisma.user.findUnique({ where: { email } })
    : (await prisma.user.findMany()).length === 1
      ? (await prisma.user.findMany())[0]
      : null;

  if (!user) {
    console.error(
      email
        ? `No user with email "${email}". Sign up/in on the site first, then rerun.`
        : "Could not determine which user to promote. Pass an email: node scripts/make-admin.js you@example.com",
    );
    process.exitCode = 1;
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role },
  });

  console.log(
    `✅ ${updated.email} (${updated.name}) is now role=${updated.role}`,
  );
}

main()
  .catch((e) => console.error("ERROR:", e.message))
  .finally(() => prisma.$disconnect());
