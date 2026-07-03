import { useState, type KeyboardEvent } from "react";

interface TagListInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function TagListInput({ values, onChange, placeholder }: TagListInputProps) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-2 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
      {values.map((value) => (
        <span key={value} className="flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
          {value}
          <button type="button" onClick={() => onChange(values.filter((v) => v !== value))} className="text-brand-500 hover:text-brand-800">
            &times;
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={placeholder}
        className="min-w-[120px] flex-1 border-none py-1 text-sm outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
