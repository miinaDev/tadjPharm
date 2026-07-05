import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Field";

interface PasswordConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  error?: string | null;
  loading?: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

// Etape de reauthentification : demande le mot de passe admin avant une action sensible.
export function PasswordConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  error,
  loading = false,
  onConfirm,
  onCancel,
}: PasswordConfirmDialogProps) {
  const [password, setPassword] = useState("");

  // Reinitialise le champ a chaque ouverture (la modale reste montee entre deux ouvertures).
  useEffect(() => {
    if (open) setPassword("");
  }, [open]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.trim()) onConfirm(password);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" onClick={onCancel}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}

        <div className="mt-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe admin"
            autoComplete="current-password"
            autoFocus
          />
          {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
          <button
            type="submit"
            disabled={!password.trim() || loading}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white shadow-sm shadow-red-600/20 transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Suppression..." : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
