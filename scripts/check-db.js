const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const carCount = await prisma.car.count();
  const statusCounts = await prisma.car.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      clerkUserId: true,
    },
  });

  console.log("Total cars:", carCount);
  console.log("Cars by status:", JSON.stringify(statusCounts));
  console.log("Users:");
  for (const u of users) {
    console.log(
      `  ${u.email} | role=${u.role} | name=${u.name} | clerkUserId=${u.clerkUserId}`,
    );
  }
}

main()
  .catch((e) => console.error("ERROR:", e.message))
  .finally(() => prisma.$disconnect());
