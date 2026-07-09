export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  // Presentes via GET /api/categories ; absentes quand la categorie est imbriquee dans un produit.
  subcategories?: Subcategory[];
}

// Categorie cote admin : avec compteurs de produits (categorie + sous-categories).
export interface AdminSubcategory extends Subcategory {
  productCount: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  subcategories: AdminSubcategory[];
}

export interface ProductColor {
  id: string;
  label: string;
  hexCode: string | null;
}

export interface ProductSize {
  id: string;
  label: string;
}

export interface ProductVolume {
  id: string;
  label: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  colorId: string | null;
  sizeId: string | null;
  volumeId: string | null;
  color: ProductColor | null;
  size: ProductSize | null;
  volume: ProductVolume | null;
  priceOverride: number | null;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  position: number;
  colorId: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  discountPercent: number;
  ribbonLabel: string | null;
  isActive: boolean;
  isAvailable: boolean;
  isDeliverable: boolean;
  hasColors: boolean;
  hasSizes: boolean;
  hasVolumes: boolean;
  categoryId: string;
  category: Category;
  subcategoryId: string | null;
  subcategory: Subcategory | null;
  images: ProductImage[];
  colors: ProductColor[];
  sizes: ProductSize[];
  volumes: ProductVolume[];
  variants: ProductVariant[];
}

export interface DeliveryBureau {
  id: string;
  wilayaId: number;
  name: string;
  isActive: boolean;
}

export interface Wilaya {
  id: number;
  name: string;
  homePrice: number;
  officePrice: number;
  isActive: boolean;
  bureaus: DeliveryBureau[];
}

export type OrderStatus = "NOUVELLE" | "CONFIRMEE" | "EXPEDIEE" | "LIVREE" | "ANNULEE";
export type ShippingMethod = "HOME" | "OFFICE";

export interface OrderItem {
  id: string;
  variantId: string | null;
  variant: (ProductVariant & { product: Product }) | null;
  quantity: number;
  unitPriceSnapshot: number;
  productNameSnapshot: string;
  variantLabelSnapshot: string;
}

export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  wilayaId: number | null;
  wilaya: Wilaya | null;
  wilayaNameSnapshot: string;
  shippingMethod: ShippingMethod;
  address: string;
  bureauId: string | null;
  bureau: DeliveryBureau | null;
  bureauNameSnapshot: string | null;
  items: OrderItem[];
  deliveryFeeSnapshot: number;
  totalSnapshot: number;
  status: OrderStatus;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
}

export interface UnavailableProduct {
  productId: string;
  productName: string;
}

export interface DashboardStats {
  newOrders: number;
  monthOrders: number;
  prevMonthOrders: number;
  monthRevenue: number;
  monthAvgBasket: number;
  unavailableCount: number;
  recentOrders: Order[];
  unavailable: UnavailableProduct[];
}
