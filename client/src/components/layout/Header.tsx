import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useCategories } from "../../hooks/useCatalog";

export function Header() {
  const cart = useCart();
  const { data: categories } = useCategories();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/", label: "Tous les produits", active: pathname === "/" },
    ...(categories ?? []).map((c) => ({
      to: `/categorie/${c.slug}`,
      label: c.name,
      active: pathname === `/categorie/${c.slug}`,
    })),
  ];

  return (
    <header className="sticky top-0 z-50 bg-canvas/85 backdrop-blur">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative z-50 flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm transition hover:text-brand-600"
              aria-label="Menu des categories"
              aria-expanded={menuOpen}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>

            <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-brand-900">
              <img src="/logo.png" alt="Logo TadjPharm" className="h-9 w-auto" />
              Tadj<span className="-ml-2 text-brand-500">Pharm</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={cart.openCart}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm transition hover:text-brand-600"
            aria-label="Ouvrir le panier"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l3.6-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-10 4a1 1 0 102 0 1 1 0 00-2 0zm10 0a1 1 0 102 0 1 1 0 00-2 0z"
              />
            </svg>
            {cart.totalCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white ring-2 ring-canvas">
                {cart.totalCount}
              </span>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="absolute left-4 right-4 top-full z-50 mt-1 overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-100 sm:left-6 sm:right-auto sm:w-72">
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Categories</p>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  link.active ? "bg-brand-50 text-brand-600" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.label}
                <svg viewBox="0 0 24 24" className="h-4 w-4 opacity-40" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </nav>
        )}
      </div>

      {menuOpen && <button className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuOpen(false)} aria-hidden tabIndex={-1} />}
    </header>
  );
}
