import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Appareillage", slug: "appareillage" },
  { name: "Materiel medical", slug: "materiel-medical" },
  { name: "Orthopedique", slug: "orthopedique" },
  { name: "Consommables", slug: "consommables" },
  { name: "Bebes", slug: "bebes" },
];

const DEFAULT_DELIVERY_PRICE = 400;

const WILAYAS: Array<[number, string]> = [
  [1, "Adrar"],
  [2, "Chlef"],
  [3, "Laghouat"],
  [4, "Oum El Bouaghi"],
  [5, "Batna"],
  [6, "Bejaia"],
  [7, "Biskra"],
  [8, "Bechar"],
  [9, "Blida"],
  [10, "Bouira"],
  [11, "Tamanrasset"],
  [12, "Tebessa"],
  [13, "Tlemcen"],
  [14, "Tiaret"],
  [15, "Tizi Ouzou"],
  [16, "Alger"],
  [17, "Djelfa"],
  [18, "Jijel"],
  [19, "Setif"],
  [20, "Saida"],
  [21, "Skikda"],
  [22, "Sidi Bel Abbes"],
  [23, "Annaba"],
  [24, "Guelma"],
  [25, "Constantine"],
  [26, "Medea"],
  [27, "Mostaganem"],
  [28, "M'Sila"],
  [29, "Mascara"],
  [30, "Ouargla"],
  [31, "Oran"],
  [32, "El Bayadh"],
  [33, "Illizi"],
  [34, "Bordj Bou Arreridj"],
  [35, "Boumerdes"],
  [36, "El Tarf"],
  [37, "Tindouf"],
  [38, "Tissemsilt"],
  [39, "El Oued"],
  [40, "Khenchela"],
  [41, "Souk Ahras"],
  [42, "Tipaza"],
  [43, "Mila"],
  [44, "Ain Defla"],
  [45, "Naama"],
  [46, "Ain Temouchent"],
  [47, "Ghardaia"],
  [48, "Relizane"],
  [49, "Timimoun"],
  [50, "Bordj Badji Mokhtar"],
  [51, "Ouled Djellal"],
  [52, "Beni Abbes"],
  [53, "In Salah"],
  [54, "In Guezzam"],
  [55, "Touggourt"],
  [56, "Djanet"],
  [57, "El M'Ghair"],
  [58, "El Meniaa"],
];

async function main() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  for (const [id, name] of WILAYAS) {
    await prisma.wilaya.upsert({
      where: { id },
      update: {},
      create: { id, name, deliveryPrice: DEFAULT_DELIVERY_PRICE },
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
