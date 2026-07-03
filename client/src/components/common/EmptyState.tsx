export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 px-6 py-16 text-center">
      <p className="text-base font-medium text-slate-700">{title}</p>
      {description && <p className="text-sm text-slate-400">{description}</p>}
    </div>
  );
}
