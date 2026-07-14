import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAdmin } from "../middleware/auth";
import { uploadExcelFile, uploadProductImages } from "../middleware/upload";
import * as authController from "../controllers/admin.auth.controller";
import * as productsController from "../controllers/admin.products.controller";
import * as ordersController from "../controllers/admin.orders.controller";
import * as wilayasController from "../controllers/admin.wilayas.controller";
import * as categoriesController from "../controllers/admin.categories.controller";
import * as importController from "../controllers/admin.import.controller";
import * as statsController from "../controllers/admin.stats.controller";

export const adminRouter = Router();

// Auth
adminRouter.post("/auth/login", asyncHandler(authController.login));
adminRouter.post("/auth/logout", asyncHandler(authController.logout));
adminRouter.get("/auth/me", asyncHandler(authController.me));

// Tout ce qui suit necessite d'etre authentifie
adminRouter.use(requireAdmin);

// Tableau de bord
adminRouter.get("/stats", asyncHandler(statsController.getStats));

// Produits / variantes / images
adminRouter.get("/products", asyncHandler(productsController.listProducts));
adminRouter.get("/products/:id", asyncHandler(productsController.getProduct));
adminRouter.post("/products", asyncHandler(productsController.createProduct));
adminRouter.put("/products/:id", asyncHandler(productsController.updateProduct));
adminRouter.delete("/products/:id", asyncHandler(productsController.deleteProduct));
adminRouter.post("/products/:id/options", asyncHandler(productsController.addOption));
adminRouter.delete("/products/:id/options/:type/:optionId", asyncHandler(productsController.removeOption));
adminRouter.put("/products/:id/colors/:colorId", asyncHandler(productsController.updateColor));
adminRouter.post("/products/:id/variants", asyncHandler(productsController.createVariant));
adminRouter.put("/variants/:variantId", asyncHandler(productsController.updateVariant));
adminRouter.delete("/variants/:variantId", asyncHandler(productsController.deleteVariant));
adminRouter.post("/products/:id/images", uploadProductImages.array("images", 6), asyncHandler(productsController.addImages));
adminRouter.put("/products/:id/images/:imageId", asyncHandler(productsController.setImageColor));
adminRouter.delete("/images/:imageId", asyncHandler(productsController.deleteImage));

// Commandes
adminRouter.get("/orders", asyncHandler(ordersController.listOrders));
adminRouter.get("/orders/:id", asyncHandler(ordersController.getOrder));
adminRouter.patch("/orders/:id/status", asyncHandler(ordersController.updateStatus));
adminRouter.patch("/orders/:id/note", asyncHandler(ordersController.updateNote));

// Wilayas & bureaux de livraison
adminRouter.get("/wilayas/catalog", asyncHandler(wilayasController.getWilayaCatalog));
adminRouter.get("/wilayas", asyncHandler(wilayasController.listWilayas));
adminRouter.post("/wilayas", asyncHandler(wilayasController.createWilaya));
adminRouter.put("/wilayas/:id", asyncHandler(wilayasController.updateWilaya));
adminRouter.delete("/wilayas/:id", asyncHandler(wilayasController.deleteWilaya));
adminRouter.post("/wilayas/:id/bureaus", asyncHandler(wilayasController.createBureau));
adminRouter.put("/bureaus/:bureauId", asyncHandler(wilayasController.updateBureau));
adminRouter.delete("/bureaus/:bureauId", asyncHandler(wilayasController.deleteBureau));

// Categories & sous-categories
adminRouter.get("/categories", asyncHandler(categoriesController.listCategories));
adminRouter.post("/categories", asyncHandler(categoriesController.createCategory));
adminRouter.put("/categories/:id", asyncHandler(categoriesController.updateCategory));
adminRouter.delete("/categories/:id", asyncHandler(categoriesController.deleteCategory));
adminRouter.post("/categories/:id/subcategories", asyncHandler(categoriesController.createSubcategory));
adminRouter.put("/subcategories/:subId", asyncHandler(categoriesController.updateSubcategory));
adminRouter.delete("/subcategories/:subId", asyncHandler(categoriesController.deleteSubcategory));

// Import Excel
adminRouter.post("/import/products", uploadExcelFile.single("file"), asyncHandler(importController.importProducts));
adminRouter.get("/import/template", asyncHandler(importController.downloadTemplate));
