import type { OrderStatus } from "../../types";
import { Badge } from "../ui/Badge";
import { IconChevronDown } from "../ui/icons";

const STATUS_TONES: Record<OrderStatus, "blue" | "amber" | "green" | "red" | "brand"> = {
  NOUVELLE: "blue",
  CONFIRMEE: "amber",
  EXPEDIEE: "brand",
  LIVREE: "green",
  ANNULEE: "red",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  NOUVELLE: "Nouvelle",
  CONFIRMEE: "Confirmee",
  EXPEDIEE: "Expediee",
  LIVREE: "Livree",
  ANNULEE: "Annulee",
};

const STATUS_SELECT_CLASSES: Record<OrderStatus, string> = {
  NOUVELLE: "bg-blue-50 text-blue-700 ring-blue-600/20",
  CONFIRMEE: "bg-amber-50 text-amber-700 ring-amber-600/20",
  EXPEDIEE: "bg-brand-50 text-brand-700 ring-brand-600/20",
  LIVREE: "bg-green-50 text-green-700 ring-green-600/20",
  ANNULEE: "bg-red-50 text-red-700 ring-red-600/20",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>;
}

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = (
  Object.keys(STATUS_LABELS) as OrderStatus[]
).map((value) => ({ value, label: STATUS_LABELS[value] }));

interface StatusSelectProps {
  status: OrderStatus;
  onChange: (status: OrderStatus) => void;
}

export function StatusSelect({ status, onChange }: StatusSelectProps) {
  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as OrderStatus)}
        className={`cursor-pointer appearance-none rounded-md py-1 pl-2.5 pr-6 text-xs font-medium ring-1 ring-inset focus:outline-none focus:ring-2 ${STATUS_SELECT_CLASSES[status]}`}
      >
        {ORDER_STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <IconChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-current opacity-60" />
    </div>
  );
}
