import { faker } from "@faker-js/faker";
import { prisma } from "../lib/db";

async function main() {
  console.log("Seeding database...");

  // Clear existing data to ensure a clean slate
  // await prisma.preorder.deleteMany({}); // Optional: comment out if you want to add to existing data

  const preordersData = [];

  for (let i = 0; i < 10; i++) {
    const startsAt = faker.date.recent({ days: 30 });
    // Ensure endsAt is after startsAt, or null
    const endsAt = faker.datatype.boolean(0.75)
      ? faker.date.future({ refDate: startsAt })
      : null;

    preordersData.push({
      name: faker.commerce.productName(),
      products: faker.number.int({ min: 1, max: 1000 }),
      preorderWhen: `${faker.number.int({ min: 1, max: 12 })} ${faker.helpers.arrayElement(['days', 'weeks', 'months'])}`,
      startsAt,
      endsAt,
      status: faker.datatype.boolean(),
    });
  }

  await prisma.preorder.createMany({
    data: preordersData,
  });

  console.log("Seeding complete. 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });