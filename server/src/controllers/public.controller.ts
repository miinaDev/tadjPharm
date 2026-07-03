import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { createOrderSchema } from "../validators/order.validator";
import * as productService from "../services/product.service";
import * as orderService from "../services/order.service";
import * as wilayaService from "../services/wilaya.service";

export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(categories);
}

export async function listProducts(req: Request, res: Response) {
  const categorySlug = typeof req.query.categorySlug === "string" ? req.query.categorySlug : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const products = await productService.listPublicProducts({ categorySlug, search });
  res.json(products);
}

export async function getProduct(req: Request, res: Response) {
  const product = await productService.getPublicProductBySlug(req.params.slug);
  res.json(product);
}

export async function listWilayas(_req: Request, res: Response) {
  const wilayas = await wilayaService.listPublicWilayas();
  res.json(wilayas);
}

export async function createOrder(req: Request, res: Response) {
  const input = createOrderSchema.parse(req.body);
  const order = await orderService.createOrder(input);
  res.status(201).json(order);
}

export async function getOrder(req: Request, res: Response) {
  const order = await orderService.getOrderById(req.params.id);
  res.json(order);
}
