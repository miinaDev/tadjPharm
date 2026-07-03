interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function Switch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className="flex cursor-pointer items-start justify-between gap-3 py-1 outline-none"
    >
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description && <span className="block text-xs text-slate-400">{description}</span>}
      </span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-brand-600" : "bg-slate-200"
        }`}
      >
        <span
          className="inline-block transform rounded-full bg-white shadow transition-transform"
          style={{ height: 18, width: 18, transform: checked ? "translateX(22px)" : "translateX(4px)" }}
        />
      </span>
    </div>
  );
}
