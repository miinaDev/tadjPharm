import type { Request, Response } from "express";
import * as orderService from "../services/order.service";
import { updateOrderDeliveryFeeSchema, updateOrderNoteSchema, updateOrderStatusSchema } from "../validators/order.validator";
import type { OrderStatus } from "@prisma/client";

export async function listOrders(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const status = typeof req.query.status === "string" ? (req.query.status as OrderStatus) : undefined;
  const wilayaId = req.query.wilayaId ? Number(req.query.wilayaId) : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const result = await orderService.listAdminOrders({ page, pageSize, status, wilayaId, search });
  res.json(result);
}

export async function getOrder(req: Request, res: Response) {
  const order = await orderService.getOrderById(req.params.id);
  res.json(order);
}

export async function updateStatus(req: Request, res: Response) {
  const { status } = updateOrderStatusSchema.parse(req.body);
  const order = await orderService.updateOrderStatus(req.params.id, status);
  res.json(order);
}

export async function updateNote(req: Request, res: Response) {
  const { note } = updateOrderNoteSchema.parse(req.body);
  const order = await orderService.updateOrderNote(req.params.id, note);
  res.json(order);
}

export async function updateDeliveryFee(req: Request, res: Response) {
  const { deliveryFee } = updateOrderDeliveryFeeSchema.parse(req.body);
  const order = await orderService.updateOrderDeliveryFee(req.params.id, deliveryFee);
  res.json(order);
}
