function scrollToCatalogue() {
  document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IconTruck() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" />
    </svg>
  );
}
function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 015.5 5H18a2 2 0 012 2v1H6a2 2 0 00-2 2v0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h15a1 1 0 011 1v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
      <circle cx="16.5" cy="13" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

const features = [
  { icon: <IconShield />, title: "Produits certifies", sub: "Qualite garantie" },
  { icon: <IconTruck />, title: "Livraison 58 wilayas", sub: "Partout en Algerie" },
  { icon: <IconWallet />, title: "Paiement a la livraison", sub: "Sans avance" },
];

export function Hero() {
  return (
    <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-brand-50 to-brand-100 shadow-sm ring-1 ring-white/70">
      {/* decorative dots */}
      <div className="pointer-events-none absolute left-6 top-6 hidden grid-cols-4 gap-1.5 opacity-40 sm:grid">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-brand-400" />
        ))}
      </div>
      <div className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-brand-300/25 blur-3xl" />

      <div className="grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT */}
        <div className="relative z-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-500">
            Votre sante, notre priorite
          </span>

          <h1 className="mt-4 font-serif leading-[1.05] tracking-tight">
            <span className="block text-4xl text-slate-900 sm:text-5xl">Votre pharmacie</span>
            <span className="block text-3xl text-brand-400 sm:text-4xl">paramedicale en ligne</span>
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-600">
            Un catalogue <span className="font-semibold text-brand-600">sur</span> et{" "}
            <span className="font-semibold text-brand-600">complet</span> : appareillage, materiel medical, orthopedie et
            articles bebe, livres directement chez vous.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={scrollToCatalogue}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
            >
              Voir nos produits
            </button>
            <button
              type="button"
              onClick={scrollToCatalogue}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/70 px-7 py-3.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 transition hover:bg-white"
            >
              Toutes les categories
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* RIGHT — photo blended in the blue theme */}
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-xl shadow-brand-900/10 ring-1 ring-white/60">
            <img
              src="/hero-paramedical.jpg"
              alt="Materiel paramedical"
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-700/55 via-brand-500/20 to-transparent mix-blend-multiply" />
            <div className="absolute inset-0 bg-brand-500/10" />
          </div>

          {/* circular badge */}
          <div className="absolute -bottom-3 -left-3 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-brand-500 text-center text-white shadow-xl ring-4 ring-white/40 sm:h-32 sm:w-32">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c5-2 8-6 8-11V5l-8-2-8 2v5c0 5 3 9 8 11z" />
            </svg>
            <span className="mt-1 text-[13px] font-bold leading-tight">58 wilayas</span>
            <span className="text-[10px] leading-tight text-white/80">Livraison rapide</span>
          </div>
        </div>
      </div>

      {/* bottom feature bar */}
      <div className="relative grid grid-cols-1 gap-px overflow-hidden border-t border-white/60 bg-white/40 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="flex items-center gap-3 px-6 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
              {f.icon}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-800">{f.title}</p>
              <p className="text-xs text-slate-500">{f.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
