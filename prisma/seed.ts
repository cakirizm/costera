import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "demo@costera.app" } });
  if (existing) {
    console.log("Seed data already exists, skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash("costera123", 12);

  const user = await prisma.user.create({
    data: {
      email: "demo@costera.app",
      name: "Demo User",
      passwordHash,
    },
  });

  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Demo Restaurant",
      city: "Istanbul",
      targetFoodCostPct: 25,
    },
  });

  await prisma.membership.create({
    data: {
      userId: user.id,
      restaurantId: restaurant.id,
      role: "OWNER",
    },
  });

  console.log("Seed complete: demo@costera.app / costera123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
