import { prisma } from "../prisma";
import { HttpError } from "../middleware/errorHandler";
import { toNumber } from "../utils/decimal";
import { ALGERIAN_WILAYAS, OFFICIAL_WILAYA_BY_ID } from "../constants/wilayas";

function serializeWilaya(wilaya: any) {
  return {
    ...wilaya,
    homePrice: toNumber(wilaya.homePrice),
    officePrice: toNumber(wilaya.officePrice),
    bureaus: wilaya.bureaus ?? undefined,
  };
}

const WILAYA_INCLUDE_ACTIVE_BUREAUS = {
  bureaus: { where: { isActive: true }, orderBy: { position: "asc" as const } },
};
const WILAYA_INCLUDE_ALL_BUREAUS = {
  bureaus: { orderBy: { position: "asc" as const } },
};

export async function listPublicWilayas() {
  const wilayas = await prisma.wilaya.findMany({
    where: { isActive: true },
    include: WILAYA_INCLUDE_ACTIVE_BUREAUS,
    orderBy: { id: "asc" },
  });
  return wilayas.map(serializeWilaya);
}

export async function listAdminWilayas() {
  const wilayas = await prisma.wilaya.findMany({
    include: WILAYA_INCLUDE_ALL_BUREAUS,
    orderBy: { id: "asc" },
  });
  return wilayas.map(serializeWilaya);
}

/** Wilayas officielles pas encore presentes en base (pour le menu d'ajout). */
export async function listWilayaCatalog() {
  const existing = await prisma.wilaya.findMany({ select: { id: true } });
  const existingIds = new Set(existing.map((w) => w.id));
  return ALGERIAN_WILAYAS.filter((w) => !existingIds.has(w.id));
}

export async function createWilaya(input: { id?: number; name?: string }) {
  // Chemin officiel : code 1-58 dont le nom vient de la liste officielle.
  if (input.id != null) {
    const official = OFFICIAL_WILAYA_BY_ID.get(input.id);
    if (!official) throw new HttpError(400, "Code de wilaya invalide");

    const existing = await prisma.wilaya.findUnique({ where: { id: input.id } });
    if (existing) throw new HttpError(409, "Cette wilaya existe deja");

    const created = await prisma.wilaya.create({
      data: { id: official.id, name: official.name },
      include: WILAYA_INCLUDE_ALL_BUREAUS,
    });
    return serializeWilaya(created);
  }

  // Chemin personnalise : nom libre, id auto-assigne au-dela de la plage officielle (>= 59).
  const name = input.name?.trim();
  if (!name) throw new HttpError(400, "Nom de wilaya requis");

  const duplicate = await prisma.wilaya.findUnique({ where: { name } });
  if (duplicate) throw new HttpError(409, "Une wilaya porte deja ce nom");

  const { _max } = await prisma.wilaya.aggregate({ _max: { id: true } });
  const nextId = Math.max(58, _max.id ?? 0) + 1;

  const created = await prisma.wilaya.create({
    data: { id: nextId, name },
    include: WILAYA_INCLUDE_ALL_BUREAUS,
  });
  return serializeWilaya(created);
}

export async function updateWilaya(
  id: number,
  input: { homePrice?: number; officePrice?: number; isActive?: boolean }
) {
  const wilaya = await prisma.wilaya.findUnique({ where: { id } });
  if (!wilaya) throw new HttpError(404, "Wilaya introuvable");
  const updated = await prisma.wilaya.update({
    where: { id },
    data: input,
    include: WILAYA_INCLUDE_ALL_BUREAUS,
  });
  return serializeWilaya(updated);
}

export async function deleteWilaya(id: number) {
  const wilaya = await prisma.wilaya.findUnique({ where: { id } });
  if (!wilaya) throw new HttpError(404, "Wilaya introuvable");

  // Les commandes conservent wilayaNameSnapshot (Order.wilayaId -> SetNull),
  // les bureaux sont supprimes en cascade (onDelete: Cascade).
  await prisma.wilaya.delete({ where: { id } });
}

// ---------- Bureaux ----------

export async function createBureau(wilayaId: number, input: { name: string }) {
  const wilaya = await prisma.wilaya.findUnique({ where: { id: wilayaId } });
  if (!wilaya) throw new HttpError(404, "Wilaya introuvable");

  const count = await prisma.deliveryBureau.count({ where: { wilayaId } });
  return prisma.deliveryBureau.create({
    data: { wilayaId, name: input.name, position: count },
  });
}

export async function updateBureau(id: string, input: { name?: string; isActive?: boolean }) {
  const bureau = await prisma.deliveryBureau.findUnique({ where: { id } });
  if (!bureau) throw new HttpError(404, "Bureau introuvable");
  return prisma.deliveryBureau.update({ where: { id }, data: input });
}

export async function deleteBureau(id: string) {
  const bureau = await prisma.deliveryBureau.findUnique({ where: { id } });
  if (!bureau) throw new HttpError(404, "Bureau introuvable");
  // onDelete: SetNull sur Order.bureauId + bureauNameSnapshot conserve l'historique.
  await prisma.deliveryBureau.delete({ where: { id } });
}
