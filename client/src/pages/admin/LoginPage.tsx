import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ApiError } from "../../api/client";
import { Field, Input } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";

export function LoginPage() {
  const { admin, loading, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && admin) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/admin/commandes";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/admin/commandes");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connexion impossible");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-sm shadow-brand-600/30">
            T
          </div>
          <p className="text-base font-bold text-slate-900">TadjPharm Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <Field label="Email" htmlFor="email">
              <Input id="email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Mot de passe" htmlFor="password">
              <Input id="password" required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <Button type="submit" variant="primary" disabled={submitting} className="w-full">
              {submitting ? "Connexion..." : "Se connecter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
