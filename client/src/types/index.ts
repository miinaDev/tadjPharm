export interface Category {
  id: string;
  name: string;
  slug: string;
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
  stockQuantity: number;
}

export interface ProductImage {
  id: string;
  url: string;
  position: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  hasColors: boolean;
  hasSizes: boolean;
  hasVolumes: boolean;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  colors: ProductColor[];
  sizes: ProductSize[];
  volumes: ProductVolume[];
  variants: ProductVariant[];
}

export interface Wilaya {
  id: number;
  name: string;
  deliveryPrice: number;
  isActive: boolean;
}

export type OrderStatus = "NOUVELLE" | "CONFIRMEE" | "EXPEDIEE" | "ANNULEE";

export interface OrderItem {
  id: string;
  variantId: string;
  variant: ProductVariant & { product: Product };
  quantity: number;
  unitPriceSnapshot: number;
}

export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  wilayaId: number;
  wilaya: Wilaya;
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
