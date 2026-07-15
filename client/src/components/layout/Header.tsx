import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useCategories } from "../../hooks/useCatalog";

export function Header() {
  const cart = useCart();
  const { data: categories } = useCategories();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sur l'accueil, le header demarre transparent, pose sur la photo du hero,
  // puis devient opaque des que l'on scrolle. Ailleurs, il est toujours opaque.
  const isHome = pathname === "/";
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const transparent = isHome && !scrolled;

  const links = [
    { to: "/", label: "Tous les produits", active: pathname === "/" },
    ...(categories ?? []).map((c) => ({
      to: `/categorie/${c.slug}`,
      label: c.name,
      active: pathname === `/categorie/${c.slug}`,
    })),
  ];

  // Actions = pilules (grammaire commune avec le CTA du hero).
  const actionButtonClass = `flex h-11 w-11 items-center justify-center rounded-full transition ${
    transparent
      ? "bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-white/20"
      : "bg-white text-slate-700 shadow-sm hover:text-brand-600"
  }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        transparent ? "bg-transparent" : "bg-canvas/85 backdrop-blur"
      }`}
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative z-50 flex items-center justify-between gap-3 py-4">
          <div className="flex min-w-0 items-center gap-2">
            {/* Hamburger : uniquement la ou la nav inline ne tient pas */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className={`${actionButtonClass} lg:hidden`}
              aria-label="Menu des catégories"
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

            <Link
              to="/"
              className={`flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight transition-colors ${
                transparent ? "text-white" : "text-brand-900"
              }`}
            >
              {/* Pastille verre depoli autour de l'ecusson, plus blanche que les autres
                  pilules : l'ecusson fonce a besoin d'un fond clair pour ressortir sur la
                  photo sombre. En mode opaque, pastille blanche comme les autres actions. */}
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                  transparent ? "bg-white/80 ring-1 ring-white/40 backdrop-blur-sm" : "bg-white shadow-sm"
                }`}
              >
                <img src="/logo.png" alt="Logo TadjPharm" className="h-8 w-auto" />
              </span>
              <span>
                Tadj<span className={transparent ? "text-brand-300" : "text-brand-500"}>Pharm</span>
              </span>
            </Link>
          </div>

          {/* Navigation primaire visible sur desktop — pas de hamburger quand la place existe */}
          <nav className="hidden min-w-0 items-center gap-0.5 lg:flex" aria-label="Catégories">
            {(categories ?? []).map((c) => {
              const active = pathname === `/categorie/${c.slug}`;
              return (
                <Link
                  key={c.id}
                  to={`/categorie/${c.slug}`}
                  className={`whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium transition ${
                    active
                      ? `underline decoration-crown-400 decoration-2 underline-offset-8 ${
                          transparent ? "text-white" : "text-brand-700"
                        }`
                      : transparent
                        ? "text-white/80 hover:text-white"
                        : "text-slate-600 hover:text-brand-700"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </nav>

          <button type="button" onClick={cart.openCart} className={`${actionButtonClass} relative shrink-0`} aria-label="Ouvrir le panier">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l3.6-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-10 4a1 1 0 102 0 1 1 0 00-2 0zm10 0a1 1 0 102 0 1 1 0 00-2 0z"
              />
            </svg>
            {cart.totalCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-crown-400 px-1 text-[10px] font-bold text-brand-900 shadow-sm">
                {cart.totalCount}
              </span>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="absolute left-4 right-4 top-full z-50 mt-1 overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-100 sm:left-6 sm:right-auto sm:w-72">
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Catégories</p>
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
