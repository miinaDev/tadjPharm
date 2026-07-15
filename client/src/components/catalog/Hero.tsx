function scrollToCatalogue() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("catalogue")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

/* Couronne du logo — rappel de la signature « la couronne de votre santé » */
function IconCrown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M3 8.2l4.2 3.1L12 5l4.8 6.3L21 8.2l-1.7 9.3H4.7L3 8.2z" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
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
function IconHome() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 10.5L12 4l8.5 6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 9.5V20h13V9.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20v-5.5h4V20" />
    </svg>
  );
}

/* Uniquement des faits verifiables — pas de slogans auto-attribues. */
const features = [
  { icon: <IconTruck />, title: "Livraison 69 wilayas", sub: "Partout en Algérie" },
  { icon: <IconWallet />, title: "Paiement à la livraison", sub: "En espèces, sans avance" },
  { icon: <IconHome />, title: "À domicile ou au bureau", sub: "Vous choisissez le retrait" },
];

export function Hero() {
  return (
    <div className="mb-3">
      {/* Full-bleed : les marges negatives font sortir la section du conteneur central
          (calc(50% - 50vw)) pour occuper toute la largeur de l'ecran.
          -mt-[6.25rem] = padding haut du <main> (1.5rem) + hauteur du header (4.75rem) :
          la photo passe SOUS le header transparent, jusqu'en haut de l'ecran. */}
      <section className="relative -mt-[6.25rem] mx-[calc(50%_-_50vw)] overflow-hidden bg-brand-900">
        {/* Photo de la boutique : legerement desaturee pour l'accorder a la palette marine
            (le magenta / jaune des rayonnages ne perce plus), cadree pour reduire le plafond.
            Lent zoom (Ken Burns) desactive en prefers-reduced-motion. */}
        <img
          src="/TadjPharm.webp"
          alt=""
          fetchPriority="high"
          className="anim-hero-zoom absolute inset-0 h-full w-full object-cover object-[50%_62%] saturate-[.68]"
        />
        {/* Voile marine degrade, calibre pour un contraste >= 4.5:1 (WCAG AA) du blanc
            sur les zones claires. La droite reste plus douce (photo visible) sans devenir
            l'aimant lumineux de la composition. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-brand-900/85 via-brand-900/70 to-brand-900/90 lg:bg-gradient-to-r lg:from-brand-900/95 lg:via-brand-900/70 lg:to-brand-900/45"
        />

        {/* Mobile : ~88svh, pour que la suite de la page depasse du pli (signal de scroll).
            Desktop : hauteur genereuse, contenu centre verticalement.
            pt-28 : reserve la place du header transparent pose au-dessus. */}
        <div className="relative mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col justify-center px-4 pb-20 pt-28 supports-[height:100svh]:min-h-[88svh] sm:min-h-[560px] sm:px-6 sm:pb-24 sm:pt-32 lg:min-h-[640px]">
          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
            <span className="anim-rise inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-sm sm:text-[11px]">
              <IconCrown className="h-3.5 w-3.5 text-crown-400" />
              La couronne de votre santé
            </span>

            {/* Le titre porte la proposition de valeur — pas le nom de la categorie.
                clamp : taille fluide, aucun palier arbitraire, aucun debordement mobile. */}
            <h1 className="anim-rise mt-5 text-[clamp(2.05rem,2.2vw+1.4rem,3.15rem)] font-extrabold leading-[1.08] tracking-tight text-white [animation-delay:90ms]">
              Votre Parapharmacie{" "}
              <span className="whitespace-nowrap text-crown-300">Connectée</span>.
            </h1>

            <p className="anim-rise mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90 [animation-delay:180ms] sm:mt-5 sm:text-lg lg:mx-0">
              Commandez en ligne, payez à la livraison. Notre équipe vous appelle pour confirmer chaque commande.
            </p>

            <div className="anim-rise mt-8 flex justify-center [animation-delay:270ms] lg:justify-start">
              <button
                type="button"
                onClick={scrollToCatalogue}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-9 py-4 text-[15px] font-semibold text-white shadow-lg shadow-brand-900/20 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 sm:w-auto sm:text-base"
              >
                Voir nos produits
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Barre de preuves : carte blanche a cheval sur la couture photo / page.
          Le chevauchement cree la transition entre le hero et le catalogue
          (et signale qu'il y a une suite sous le pli). */}
      <div className="anim-rise relative z-10 -mt-9 [animation-delay:360ms] sm:-mt-10">
        <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-white shadow-xl shadow-brand-900/10 ring-1 ring-slate-900/5">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center gap-1.5 px-2 py-3.5 text-center sm:flex-row sm:gap-3 sm:px-6 sm:py-4 sm:text-left"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 sm:h-11 sm:w-11">
                {f.icon}
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-semibold text-slate-900 sm:text-sm">{f.title}</p>
                <p className="hidden text-xs text-slate-500 sm:block">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
