/**
 * Pastille ronde qui ouvre la roue chromatique native (`<input type="color">`)
 * au clic. Zero dependance. Utilisee a la creation et a la modification.
 */
export function ColorSwatchPicker({
  hex,
  onChange,
  title,
  size = "md",
}: {
  hex: string;
  onChange: (hex: string) => void;
  title?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  return (
    <label
      title={title ?? "Choisir la couleur"}
      className={`relative inline-flex cursor-pointer items-center justify-center rounded-full ring-1 ring-slate-300 ${dim}`}
      style={{ backgroundColor: hex }}
    >
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        aria-label={title ?? "Choisir la couleur"}
      />
    </label>
  );
}
