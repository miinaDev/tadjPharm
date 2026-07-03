import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { adminAuthApi } from "../api/admin";
import { ApiError } from "../api/client";
import type { AdminUser } from "../types";

interface AdminAuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAuthApi
      .me()
      .then(setAdmin)
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 401)) {
          console.error(err);
        }
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const user = await adminAuthApi.login(email, password);
    setAdmin(user);
  }

  async function logout() {
    await adminAuthApi.logout();
    setAdmin(null);
  }

  return <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth doit etre utilise dans un AdminAuthProvider");
  return ctx;
}
