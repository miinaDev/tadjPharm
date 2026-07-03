import type { ReactNode } from "react";

type Tone = "brand" | "slate" | "green" | "red" | "amber" | "blue";

const TONE_CLASSES: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/20",
  slate: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10",
  green: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
};

export function Badge({ tone = "slate", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}
