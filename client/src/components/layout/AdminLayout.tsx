import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { IconGrid, IconLogout, IconMap, IconOrders, IconPackage, IconUpload } from "../ui/icons";
import type { ComponentType } from "react";

const NAV_ITEMS: { to: string; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { to: "/admin", label: "Tableau de bord", icon: IconGrid },
  { to: "/admin/commandes", label: "Commandes", icon: IconOrders },
  { to: "/admin/produits", label: "Produits", icon: IconPackage },
  { to: "/admin/produits/import", label: "Import Excel", icon: IconUpload },
  { to: "/admin/wilayas", label: "Wilayas", icon: IconMap },
];

function useActiveNavTo(pathname: string) {
  const matches = NAV_ITEMS.map((item) => item.to).filter(
    (to) => pathname === to || pathname.startsWith(`${to}/`)
  );
  return matches.sort((a, b) => b.length - a.length)[0];
}

export function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTo = useActiveNavTo(location.pathname);

  async function handleLogout() {
    await logout();
    navigate("/admin/login");
  }

  const initial = admin?.email?.[0]?.toUpperCase() ?? "A";

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="hidden shrink-0 border-r border-slate-200 bg-white md:flex md:w-64 md:flex-col">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">T</div>
          <div>
            <p className="text-sm font-bold leading-tight text-slate-900">TadjPharm</p>
            <p className="text-[11px] leading-tight text-slate-400">Administration</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.to === activeTo;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-600 text-white shadow-sm shadow-brand-600/20" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {initial}
            </div>
            <p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">{admin?.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Se deconnecter"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <IconLogout className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">T</div>
            <p className="text-sm font-bold text-slate-900">TadjPharm Admin</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Se deconnecter"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <IconLogout className="h-4 w-4" />
          </button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-1.5 md:hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = item.to === activeTo;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-lg px-3 py-2 text-[11px] font-medium ${
                  isActive ? "text-brand-700" : "text-slate-500"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
