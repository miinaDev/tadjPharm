import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantLabel: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "tadjpharm_cart";
// Plus de gestion de stock : on plafonne juste la quantite par article a une valeur raisonnable.
const MAX_QUANTITY = 99;

const CartContext = createContext<CartContextValue | undefined>(undefined);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(item: Omit<CartItem, "quantity">, quantity: number) {
    setItems((current) => {
      const existing = current.find((i) => i.variantId === item.variantId);
      if (existing) {
        const newQuantity = Math.min(existing.quantity + quantity, MAX_QUANTITY);
        return current.map((i) => (i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i));
      }
      return [...current, { ...item, quantity: Math.min(quantity, MAX_QUANTITY) }];
    });
    // On n'ouvre volontairement pas le tiroir a l'ajout : le retour visuel (flash « Ajoute ✓ »
    // sur la fiche produit + compteur du header) suffit et n'interrompt pas la navigation.
  }

  function updateQuantity(variantId: string, quantity: number) {
    setItems((current) =>
      current.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(Math.max(quantity, 1), MAX_QUANTITY) } : i))
    );
  }

  function removeItem(variantId: string) {
    setItems((current) => current.filter((i) => i.variantId !== variantId));
  }

  function clear() {
    setItems([]);
  }

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        totalAmount,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateQuantity,
        removeItem,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit etre utilise dans un CartProvider");
  return ctx;
}
