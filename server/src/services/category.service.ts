import { prisma } from "../prisma";
import { HttpError } from "../middleware/errorHandler";
import { comparePassword } from "../utils/password";
import { slugify, uniqueSlugSuffix } from "../utils/slugify";

const AUTRE_SLUG = "autre";

// "Autre" (categorie de repli) doit toujours apparaitre en dernier, meme si le tri est alphabetique.
function sortAutreLast<T extends { slug: string; name: string }>(categories: T[]): T[] {
  return [...categories].sort((a, b) => {
    if (a.slug === AUTRE_SLUG) return 1;
    if (b.slug === AUTRE_SLUG) return -1;
    return a.name.localeCompare(b.name, "fr");
  });
}

async function generateUniqueCategorySlug(name: string, excludeId?: string) {
  const base = slugify(name) || "categorie";
  let slug = base;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${uniqueSlugSuffix()}`;
  }
}

async function generateUniqueSubcategorySlug(categoryId: string, name: string, excludeId?: string) {
  const base = slugify(name) || "sous-categorie";
  let slug = base;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.subcategory.findUnique({ where: { categoryId_slug: { categoryId, slug } } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${uniqueSlugSuffix()}`;
  }
}

// ---------- Public ----------

export async function listPublicCategories() {
  const categories = await prisma.category.findMany({
    include: { subcategories: { orderBy: { name: "asc" } } },
  });
  return sortAutreLast(categories);
}

// ---------- Admin ----------

export async function listAdminCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      subcategories: {
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } },
      },
    },
  });
  return sortAutreLast(categories).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products,
    subcategories: c.subcategories.map((s) => ({
      id: s.id,
      categoryId: s.categoryId,
      name: s.name,
      slug: s.slug,
      productCount: s._count.products,
    })),
  }));
}

export async function createCategory(input: { name: string }) {
  const name = input.name.trim();
  const duplicate = await prisma.category.findUnique({ where: { name } });
  if (duplicate) throw new HttpError(409, "Une categorie porte deja ce nom");
  const slug = await generateUniqueCategorySlug(name);
  return prisma.category.create({ data: { name, slug } });
}

export async function updateCategory(id: string, input: { name: string }) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new HttpError(404, "Categorie introuvable");

  const name = input.name.trim();
  const duplicate = await prisma.category.findUnique({ where: { name } });
  if (duplicate && duplicate.id !== id) throw new HttpError(409, "Une categorie porte deja ce nom");

  const slug = await generateUniqueCategorySlug(name, id);
  return prisma.category.update({ where: { id }, data: { name, slug } });
}

export async function deleteCategory(id: string, adminId: string, password: string) {
  // Reauthentification : action sensible (deplace des produits + supprime des sous-categories).
  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) throw new HttpError(401, "Session invalide");
  const validPassword = await comparePassword(password, admin.passwordHash);
  if (!validPassword) throw new HttpError(403, "Mot de passe incorrect");

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new HttpError(404, "Categorie introuvable");
  if (category.slug === AUTRE_SLUG) {
    throw new HttpError(400, "La categorie « Autre » ne peut pas etre supprimee (categorie de repli)");
  }

  const autre = await prisma.category.findUnique({ where: { slug: AUTRE_SLUG } });
  if (!autre) throw new HttpError(500, "Categorie de repli « Autre » introuvable");

  const { movedProducts } = await prisma.$transaction(async (tx) => {
    // Les produits basculent vers "Autre" et perdent leur sous-categorie (qui appartient a la categorie supprimee).
    const moved = await tx.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: autre.id, subcategoryId: null },
    });
    // Les sous-categories sont supprimees en cascade avec la categorie.
    await tx.category.delete({ where: { id } });
    return { movedProducts: moved.count };
  });

  return { movedProducts };
}

// ---------- Sous-categories ----------

export async function createSubcategory(categoryId: string, input: { name: string }) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new HttpError(404, "Categorie introuvable");

  const name = input.name.trim();
  const duplicate = await prisma.subcategory.findUnique({ where: { categoryId_name: { categoryId, name } } });
  if (duplicate) throw new HttpError(409, "Une sous-categorie porte deja ce nom dans cette categorie");

  const slug = await generateUniqueSubcategorySlug(categoryId, name);
  return prisma.subcategory.create({ data: { categoryId, name, slug } });
}

export async function updateSubcategory(id: string, input: { name: string }) {
  const subcategory = await prisma.subcategory.findUnique({ where: { id } });
  if (!subcategory) throw new HttpError(404, "Sous-categorie introuvable");

  const name = input.name.trim();
  const duplicate = await prisma.subcategory.findUnique({
    where: { categoryId_name: { categoryId: subcategory.categoryId, name } },
  });
  if (duplicate && duplicate.id !== id) {
    throw new HttpError(409, "Une sous-categorie porte deja ce nom dans cette categorie");
  }

  const slug = await generateUniqueSubcategorySlug(subcategory.categoryId, name, id);
  return prisma.subcategory.update({ where: { id }, data: { name, slug } });
}

export async function deleteSubcategory(id: string) {
  const subcategory = await prisma.subcategory.findUnique({ where: { id } });
  if (!subcategory) throw new HttpError(404, "Sous-categorie introuvable");
  // Product.subcategoryId -> SetNull : les produits retombent sur leur seule categorie.
  await prisma.subcategory.delete({ where: { id } });
}
