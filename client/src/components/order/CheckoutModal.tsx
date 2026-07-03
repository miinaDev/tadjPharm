import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useWilayas } from "../../hooks/useWilayas";
import { useCreateOrder } from "../../hooks/useCreateOrder";
import { OrderSummary } from "./OrderSummary";
import { QuantityStepper } from "./QuantityStepper";
import { PriceTag } from "../product/PriceTag";
import { ApiError, resolveMediaUrl } from "../../api/client";

export interface CheckoutLine {
  variantId: string;
  productName: string;
  variantLabel: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

interface CheckoutModalProps {
  lines: CheckoutLine[];
  onQuantityChange: (variantId: string, quantity: number) => void;
  onRemove?: (variantId: string) => void;
  onClose: () => void;
  onOrderPlaced?: () => void;
}

export function CheckoutModal({ lines, onQuantityChange, onRemove, onClose, onOrderPlaced }: CheckoutModalProps) {
  const navigate = useNavigate();
  const { data: wilayas, isLoading: wilayasLoading } = useWilayas();
  const createOrder = useCreateOrder();

  const [wilayaId, setWilayaId] = useState<number | "">("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedWilaya = wilayas?.find((w) => w.id === wilayaId);
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!wilayaId) {
      setError("Veuillez choisir une wilaya");
      return;
    }
    if (lines.length === 0) {
      setError("Votre panier est vide");
      return;
    }
    try {
      const order = await createOrder.mutateAsync({
        items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        wilayaId,
        firstName,
        lastName,
        email,
        phone,
      });
      onOrderPlaced?.();
      navigate(`/commande/${order.id}/confirmation`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue, veuillez reessayer.");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Finaliser la commande</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-2.5">
          {lines.map((line) => (
            <div key={line.variantId} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2.5">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {line.imageUrl && <img src={resolveMediaUrl(line.imageUrl)} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{line.productName}</p>
                <p className="text-xs text-slate-400">{line.variantLabel}</p>
                <div className="mt-1.5 flex items-center gap-3">
                  <QuantityStepper
                    quantity={line.quantity}
                    max={line.maxStock}
                    size="sm"
                    onChange={(q) => onQuantityChange(line.variantId, q)}
                  />
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(line.variantId)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                      aria-label="Retirer du panier"
                    >
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <PriceTag amount={line.unitPrice * line.quantity} className="shrink-0 self-start text-sm font-semibold text-slate-900" />
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Prenom</label>
              <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Nom</label>
              <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Telephone</label>
            <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Wilaya</label>
            <select
              required
              value={wilayaId}
              onChange={(e) => setWilayaId(Number(e.target.value))}
              disabled={wilayasLoading}
              className={inputClass}
            >
              <option value="">Selectionner...</option>
              {wilayas?.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} - {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-1">
            <OrderSummary subtotal={subtotal} itemCount={itemCount} deliveryFee={selectedWilaya?.deliveryPrice ?? null} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={createOrder.isPending || lines.length === 0}
            className="mt-1 w-full rounded-full bg-brand-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 disabled:opacity-60"
          >
            {createOrder.isPending ? "Envoi en cours..." : "Confirmer la commande"}
          </button>
        </form>
      </div>
    </div>
  );
}
