import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as publicController from "../controllers/public.controller";

export const publicRouter = Router();

publicRouter.get("/categories", asyncHandler(publicController.listCategories));
publicRouter.get("/products", asyncHandler(publicController.listProducts));
publicRouter.get("/products/:slug", asyncHandler(publicController.getProduct));
publicRouter.get("/wilayas", asyncHandler(publicController.listWilayas));
publicRouter.post("/orders", asyncHandler(publicController.createOrder));
publicRouter.get("/orders/:id", asyncHandler(publicController.getOrder));
