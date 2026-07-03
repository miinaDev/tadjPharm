import { prisma } from "../prisma";
import { HttpError } from "../middleware/errorHandler";
import { toNumber } from "../utils/decimal";

function serializeWilaya(wilaya: any) {
  return { ...wilaya, deliveryPrice: toNumber(wilaya.deliveryPrice) };
}

export async function listPublicWilayas() {
  const wilayas = await prisma.wilaya.findMany({ where: { isActive: true }, orderBy: { id: "asc" } });
  return wilayas.map(serializeWilaya);
}

export async function listAdminWilayas() {
  const wilayas = await prisma.wilaya.findMany({ orderBy: { id: "asc" } });
  return wilayas.map(serializeWilaya);
}

export async function updateWilaya(id: number, input: { deliveryPrice?: number; isActive?: boolean }) {
  const wilaya = await prisma.wilaya.findUnique({ where: { id } });
  if (!wilaya) throw new HttpError(404, "Wilaya introuvable");
  const updated = await prisma.wilaya.update({ where: { id }, data: input });
  return serializeWilaya(updated);
}
