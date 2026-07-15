import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ordersApi } from "../../api/orders";
import { Spinner } from "../../components/common/Spinner";
import { PriceTag } from "../../components/product/PriceTag";

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getOrder(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-sm text-gray-600">Commande introuvable.</p>;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-3xl text-white shadow-lg shadow-brand-500/30">
        ✓
      </div>
      <h1 className="text-xl font-bold text-slate-900">Commande enregistree</h1>
      <p className="text-sm text-slate-500">
        Votre commande a bien ete enregistree. Notre equipe vous contactera par telephone au <strong>{order.phone}</strong> pour
        confirmer.
      </p>

      {order.specialDelivery && (
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm leading-relaxed text-amber-700">
          Votre commande contient un produit à livraison spéciale. Le tarif de livraison n'est pas encore fixé : il vous sera
          communiqué par la parapharmacie lors de la confirmation.
        </div>
      )}

      <div className="w-full rounded-3xl bg-white p-5 text-left text-sm shadow-sm">
        <div className="mb-3 flex flex-col gap-1.5 border-b border-slate-100 pb-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-2">
              <span className="text-slate-700">
                {item.productNameSnapshot || item.variant?.product?.name} &times; {item.quantity}
              </span>
              <PriceTag amount={item.unitPriceSnapshot * item.quantity} className="font-medium text-slate-800" />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Client</span>
          <span className="text-slate-700">{order.fullName}</span>
        </div>
        <div className="mt-1 flex justify-between text-slate-500">
          <span>Wilaya</span>
          <span className="text-slate-700">{order.wilayaNameSnapshot || order.wilaya?.name}</span>
        </div>
        <div className="mt-1 flex justify-between gap-4 text-slate-500">
          <span>Livraison</span>
          <span className="text-right text-slate-700">
            {order.shippingMethod === "OFFICE"
              ? `Bureau : ${order.bureau?.name ?? order.bureauNameSnapshot ?? "-"}`
              : `A domicile - ${order.address}`}
          </span>
        </div>
        <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
          <span>Total</span>
          <PriceTag amount={order.totalSnapshot} />
        </div>
      </div>

      <Link
        to="/"
        className="mt-2 rounded-full bg-brand-50 px-6 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-100"
      >
        Retour au catalogue
      </Link>
    </div>
  );
}
