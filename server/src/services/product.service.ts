import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { HttpError } from "../middleware/errorHandler";
import { toNumber } from "../utils/decimal";
import { slugify, uniqueSlugSuffix } from "../utils/slugify";
import { saveImage, deleteStoredImage } from "./storage.service";
import type { CreateProductInput, CreateVariantInput, UpdateColorInput, UpdateProductInput, UpdateVariantInput } from "./product.types";

const PRODUCT_INCLUDE = {
  category: true,
  subcategory: true,
  images: { orderBy: { position: "asc" as const } },
  colors: true,
  sizes: true,
  volumes: true,
  variants: { include: { color: true, size: true, volume: true } },
};

// Verifie qu'une sous-categorie (si fournie) appartient bien a la categorie choisie.
async function assertSubcategoryBelongsToCategory(subcategoryId: string, categoryId: string) {
  const subcategory = await prisma.subcategory.findUnique({ where: { id: subcategoryId } });
  if (!subcategory || subcategory.categoryId !== categoryId) {
    throw new HttpError(400, "La sous-categorie ne correspond pas a la categorie choisie");
  }
}

function serializeProduct(product: any) {
  return {
    ...product,
    basePrice: toNumber(product.basePrice),
    variants: product.variants?.map((v: any) => ({
      ...v,
      priceOverride: toNumber(v.priceOverride),
    })),
  };
}

async function generateUniqueSlug(name: string) {
  const base = slugify(name);
  let slug = base;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${base}-${uniqueSlugSuffix()}`;
  }
}

export async function listPublicProducts(params: {
  categorySlug?: string;
  subcategorySlug?: string;
  search?: string;
  page: number;
  pageSize: number;
}) {
  // La recherche porte sur le nom du produit, de la categorie ET de la sous-categorie (comme cote admin).
  const searchFilter: Prisma.ProductWhereInput = params.search
    ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { category: { name: { contains: params.search, mode: "insensitive" } } },
          { subcategory: { name: { contains: params.search, mode: "insensitive" } } },
        ],
      }
    : {};
  const where: Prisma.ProductWhereInput = {
    AND: [
      { isActive: true },
      params.categorySlug ? { category: { slug: params.categorySlug } } : {},
      params.subcategorySlug ? { subcategory: { slug: params.subcategorySlug } } : {},
      searchFilter,
    ],
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.product.count({ where }),
  ]);
  return { products: products.map(serializeProduct), total };
}

export async function getPublicProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: PRODUCT_INCLUDE,
  });
  if (!product) throw new HttpError(404, "Produit introuvable");
  return serializeProduct(product);
}

export async function listAdminProducts(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: "active" | "inactive";
}) {
  const searchFilter: Prisma.ProductWhereInput = params.search
    ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { category: { name: { contains: params.search, mode: "insensitive" } } },
          { subcategory: { name: { contains: params.search, mode: "insensitive" } } },
        ],
      }
    : {};
  const statusFilter: Prisma.ProductWhereInput =
    params.status === "active" ? { isActive: true } : params.status === "inactive" ? { isActive: false } : {};
  const where: Prisma.ProductWhereInput = { AND: [searchFilter, statusFilter] };

  const [products, total, activeCount, inactiveCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.product.count({ where }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: false } }),
  ]);
  return { products: products.map(serializeProduct), total, activeCount, inactiveCount };
}

export async function getAdminProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
  if (!product) throw new HttpError(404, "Produit introuvable");
  return serializeProduct(product);
}

export async function createProduct(input: CreateProductInput) {
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw new HttpError(400, "Categorie introuvable");

  if (input.subcategoryId) await assertSubcategoryBelongsToCategory(input.subcategoryId, input.categoryId);

  const slug = await generateUniqueSlug(input.name);

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        basePrice: input.basePrice,
        discountPercent: input.discountPercent,
        ribbonLabel: input.ribbonLabel?.trim() || null,
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId ?? null,
        hasColors: input.hasColors,
        hasSizes: input.hasSizes,
        hasVolumes: input.hasVolumes,
        trackStock: input.trackStock,
        lowStockThreshold: input.lowStockThreshold,
      },
    });

    const colors = input.hasColors
      ? await Promise.all(
          input.colors.map((c) => tx.productColor.create({ data: { productId: created.id, label: c.label, hexCode: c.hexCode } }))
        )
      : [];
    const sizes = input.hasSizes
      ? await Promise.all(input.sizes.map((s) => tx.productSize.create({ data: { productId: created.id, label: s.label } })))
      : [];
    const volumes = input.hasVolumes
      ? await Promise.all(input.volumes.map((v) => tx.productVolume.create({ data: { productId: created.id, label: v.label } })))
      : [];

    const hasAnyOption = input.hasColors || input.hasSizes || input.hasVolumes;

    if (hasAnyOption) {
      // Les variantes referencent les couleurs/tailles/volumes qu'on vient de creer, par label.
      const colorIdByLabel = new Map(colors.map((c) => [c.label, c.id]));
      const sizeIdByLabel = new Map(sizes.map((s) => [s.label, s.id]));
      const volumeIdByLabel = new Map(volumes.map((v) => [v.label, v.id]));

      for (const variant of input.variants) {
        await tx.productVariant.create({
          data: {
            productId: created.id,
            colorId: variant.colorLabel ? colorIdByLabel.get(variant.colorLabel) ?? null : null,
            sizeId: variant.sizeLabel ? sizeIdByLabel.get(variant.sizeLabel) ?? null : null,
            volumeId: variant.volumeLabel ? volumeIdByLabel.get(variant.volumeLabel) ?? null : null,
            stockQuantity: variant.stockQuantity,
            priceOverride: variant.priceOverride ?? null,
          },
        });
      }
    } else {
      await tx.productVariant.create({
        data: { productId: created.id, stockQuantity: input.initialStock },
      });
    }

    return { created, colors, sizes, volumes };
  });

  return getAdminProductById(product.created.id);
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new HttpError(404, "Produit introuvable");
  const data = { ...input };
  // Normaliser le ruban : chaine vide -> null (retire l'etiquette). Champ absent = non modifie.
  if (typeof data.ribbonLabel === "string") data.ribbonLabel = data.ribbonLabel.trim() || null;

  const effectiveCategoryId = input.categoryId ?? product.categoryId;
  if (input.subcategoryId) {
    // Sous-categorie explicitement choisie : elle doit appartenir a la categorie effective.
    await assertSubcategoryBelongsToCategory(input.subcategoryId, effectiveCategoryId);
  } else if (input.categoryId && input.categoryId !== product.categoryId && input.subcategoryId === undefined) {
    // Changement de categorie sans nouvelle sous-categorie : l'ancienne devient orpheline -> on la retire.
    data.subcategoryId = null;
  }

  await prisma.product.update({ where: { id }, data });
  return getAdminProductById(id);
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new HttpError(404, "Produit introuvable");

  // Suppression franche : les variantes cascadent, OrderItem.variantId -> SetNull,
  // et les commandes conservent productNameSnapshot / variantLabelSnapshot.
  await prisma.product.delete({ where: { id } });
  return { softDeleted: false };
}

export async function addOption(productId: string, type: "color" | "size" | "volume", label: string, hexCode?: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new HttpError(404, "Produit introuvable");

  if (type === "color") {
    await prisma.$transaction([
      prisma.productColor.create({ data: { productId, label, hexCode } }),
      prisma.product.update({ where: { id: productId }, data: { hasColors: true } }),
    ]);
  } else if (type === "size") {
    await prisma.$transaction([
      prisma.productSize.create({ data: { productId, label } }),
      prisma.product.update({ where: { id: productId }, data: { hasSizes: true } }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.productVolume.create({ data: { productId, label } }),
      prisma.product.update({ where: { id: productId }, data: { hasVolumes: true } }),
    ]);
  }

  return getAdminProductById(productId);
}

export async function removeOption(productId: string, type: "color" | "size" | "volume", optionId: string) {
  // Les variantes concernees cascadent ; OrderItem.variantId -> SetNull et les
  // commandes conservent leur snapshot, donc la suppression est toujours possible.
  if (type === "color") {
    await prisma.productColor.delete({ where: { id: optionId } });
  } else if (type === "size") {
    await prisma.productSize.delete({ where: { id: optionId } });
  } else {
    await prisma.productVolume.delete({ where: { id: optionId } });
  }
  return getAdminProductById(productId);
}

export async function updateColor(productId: string, colorId: string, input: UpdateColorInput) {
  const color = await prisma.productColor.findUnique({ where: { id: colorId } });
  if (!color || color.productId !== productId) throw new HttpError(404, "Couleur introuvable");
  await prisma.productColor.update({ where: { id: colorId }, data: input });
  return getAdminProductById(productId);
}

export async function createVariant(productId: string, input: CreateVariantInput) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new HttpError(404, "Produit introuvable");

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      colorId: input.colorId ?? null,
      sizeId: input.sizeId ?? null,
      volumeId: input.volumeId ?? null,
      stockQuantity: input.stockQuantity,
      priceOverride: input.priceOverride ?? null,
    },
  });
  return { ...variant, priceOverride: toNumber(variant.priceOverride) };
}

export async function updateVariant(variantId: string, input: UpdateVariantInput) {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) throw new HttpError(404, "Variante introuvable");
  const updated = await prisma.productVariant.update({ where: { id: variantId }, data: input });
  return { ...updated, priceOverride: toNumber(updated.priceOverride) };
}

export async function deleteVariant(variantId: string) {
  // OrderItem.variantId -> SetNull : les commandes conservent leur snapshot.
  await prisma.productVariant.delete({ where: { id: variantId } });
}

export async function addImages(productId: string, files: Express.Multer.File[]) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new HttpError(404, "Produit introuvable");

  const existingCount = await prisma.productImage.count({ where: { productId } });
  const images = await Promise.all(
    files.map(async (file, index) => {
      const stored = await saveImage(file);
      return prisma.productImage.create({
        data: {
          productId,
          filename: stored.ref,
          url: stored.url,
          position: existingCount + index,
        },
      });
    })
  );
  return images;
}

export async function deleteImage(imageId: string) {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) throw new HttpError(404, "Image introuvable");

  await prisma.productImage.delete({ where: { id: imageId } });
  await deleteStoredImage(image.filename);
}

// Rattache (ou detache si colorId = null) une image a une couleur du meme produit.
export async function setImageColor(productId: string, imageId: string, colorId: string | null) {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image || image.productId !== productId) throw new HttpError(404, "Image introuvable");
  if (colorId) {
    const color = await prisma.productColor.findUnique({ where: { id: colorId } });
    if (!color || color.productId !== productId) {
      throw new HttpError(400, "Cette couleur n'appartient pas au produit");
    }
  }
  await prisma.productImage.update({ where: { id: imageId }, data: { colorId } });
  return getAdminProductById(productId);
}
