import { useState, type KeyboardEvent } from "react";
import { ColorSwatchPicker } from "./ColorSwatchPicker";
import { guessColor } from "../../utils/colors";

export interface ColorValue {
  label: string;
  hexCode: string;
}

interface ColorListInputProps {
  values: ColorValue[];
  onChange: (values: ColorValue[]) => void;
  placeholder?: string;
}

export function ColorListInput({ values, onChange, placeholder }: ColorListInputProps) {
  const [draft, setDraft] = useState("");

  function addColor() {
    const label = draft.trim();
    if (label && !values.some((v) => v.label.toLowerCase() === label.toLowerCase())) {
      onChange([...values, { label, hexCode: guessColor(label) }]);
    }
    setDraft("");
  }

  function updateHex(index: number, hex: string) {
    onChange(values.map((v, i) => (i === index ? { ...v, hexCode: hex } : v)));
  }

  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addColor();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
      {values.map((value, index) => (
        <span
          key={value.label}
          className="flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-1 pr-2 text-xs font-medium text-slate-700"
        >
          <ColorSwatchPicker
            size="sm"
            hex={value.hexCode}
            title={`Couleur de ${value.label}`}
            onChange={(hex) => updateHex(index, hex)}
          />
          {value.label}
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-slate-400 hover:text-red-600"
            aria-label={`Retirer ${value.label}`}
          >
            &times;
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addColor}
        placeholder={placeholder}
        className="min-w-[120px] flex-1 border-none py-1 text-sm outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
