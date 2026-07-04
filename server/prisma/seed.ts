import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ALGERIAN_WILAYAS } from "../src/constants/wilayas";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Appareillage", slug: "appareillage" },
  { name: "Materiel medical", slug: "materiel-medical" },
  { name: "Orthopedique", slug: "orthopedique" },
  { name: "Consommables", slug: "consommables" },
  { name: "Bebes", slug: "bebes" },
  { name: "Autre", slug: "autre" },
];

const DEFAULT_DELIVERY_PRICE = 400;

async function main() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  for (const { id, name } of ALGERIAN_WILAYAS) {
    await prisma.wilaya.upsert({
      where: { id },
      update: {},
      create: { id, name, homePrice: DEFAULT_DELIVERY_PRICE, officePrice: DEFAULT_DELIVERY_PRICE },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD doivent etre definis dans server/.env pour le seed");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash },
  });

  console.log("Seed termine : categories, wilayas et admin crees.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
