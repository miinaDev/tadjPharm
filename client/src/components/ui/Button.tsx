import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20 disabled:hover:bg-brand-600",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:hover:bg-white",
  outline: "bg-transparent text-brand-700 border border-brand-200 hover:bg-brand-50 disabled:hover:bg-transparent",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 disabled:hover:bg-transparent",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50 disabled:hover:bg-white",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

export function Button({ variant = "secondary", size = "md", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
}
