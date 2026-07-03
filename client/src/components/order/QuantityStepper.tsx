interface QuantityStepperProps {
  quantity: number;
  max: number;
  onChange: (quantity: number) => void;
  size?: "sm" | "md";
}

export function QuantityStepper({ quantity, max, onChange, size = "md" }: QuantityStepperProps) {
  function clamp(value: number) {
    return Math.min(Math.max(value, 1), Math.max(max, 1));
  }

  const btn =
    size === "sm"
      ? "h-7 w-7 text-base"
      : "h-10 w-10 text-lg";
  const num = size === "sm" ? "w-6 text-sm" : "w-8 text-base";

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(clamp(quantity - 1))}
        disabled={quantity <= 1}
        className={`flex ${btn} items-center justify-center rounded-full border border-slate-200 bg-white font-medium leading-none text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label="Diminuer la quantite"
      >
        &minus;
      </button>
      <span className={`${num} text-center font-semibold tabular-nums text-slate-900`}>{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(clamp(quantity + 1))}
        disabled={quantity >= max}
        className={`flex ${btn} items-center justify-center rounded-full border border-slate-200 bg-white font-medium leading-none text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label="Augmenter la quantite"
      >
        +
      </button>
    </div>
  );
}
