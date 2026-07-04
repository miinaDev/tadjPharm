import type { ReactNode } from "react";

function scrollToCatalogue() {
  document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Geometrie hexagonale (sommets en haut/bas, comme le logo) ---------- */

function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 180) * (60 * k - 30);
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

/* Icones medicales 24x24 (trait), affichees au centre des hexagones */
const HEX_ICONS: Record<string, ReactNode> = {
  pulse: <path d="M3 12.5h4l2-5 3 9 2.5-6.5 1.5 2.5H21" />,
  shieldCross: (
    <>
      <path d="M12 3.5l6.5 2.6v4.6c0 4.2-2.8 7-6.5 8.4-3.7-1.4-6.5-4.2-6.5-8.4V6.1L12 3.5z" />
      <path d="M12 8.5v5M9.5 11h5" />
    </>
  ),
  bandage: (
    <>
      <rect x="2.8" y="8.2" width="18.4" height="7.6" rx="3.8" transform="rotate(-45 12 12)" />
      <path d="M10.6 10.6h0M13.4 10.6h0M10.6 13.4h0M13.4 13.4h0M12 12h0" strokeWidth={2.2} />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3h5M11 3v5.2L5.6 17a2 2 0 001.8 3h9.2a2 2 0 001.8-3L13 8.2V3" />
      <path d="M7.8 14.5h8.4" />
    </>
  ),
  capsule: (
    <>
      <rect x="3.5" y="8.5" width="17" height="7" rx="3.5" />
      <path d="M12 8.5v7" />
    </>
  ),
  syringe: (
    <>
      <path d="M19.5 4.5L17 7M20.5 8.5l-5-5M16 6l3 3-9 9-3-3 9-9zM7 17l-2.5 2.5" />
      <path d="M11.5 9.5l1.5 1.5M9 12l1.5 1.5" />
    </>
  ),
  firstAid: (
    <>
      <rect x="3.5" y="7" width="17" height="13" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7M12 10.5v6M9 13.5h6" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <rect x="9" y="2.5" width="6" height="4" rx="1" />
      <path d="M8.5 11h7M8.5 14.5h5" />
    </>
  ),
  thermometer: (
    <>
      <path d="M12 4a2 2 0 00-2 2v8.2a4 4 0 104 0V6a2 2 0 00-2-2z" />
      <path d="M12 9.5v4.5" />
    </>
  ),
  crossBold: <path d="M9.3 3.8h5.4v5.5h5.5v5.4h-5.5v5.5H9.3v-5.5H3.8V9.3h5.5V3.8z" fill="currentColor" stroke="none" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0112 7.2a4.2 4.2 0 017.5 2.6C19.5 15.4 12 20 12 20z" />,
};

interface HexProps {
  cx: number;
  cy: number;
  r: number;
  className: string; // utilitaires fill-* / stroke-*
  strokeWidth?: number;
  icon?: string;
  iconClass?: string; // couleur de l'icone (text-*)
}

function Hex({ cx, cy, r, className, strokeWidth = 0, icon, iconClass = "text-white" }: HexProps) {
  const box = r * 0.9;
  return (
    <g>
      <polygon points={hexPoints(cx, cy, r)} className={className} strokeWidth={strokeWidth} />
      {icon && (
        <g
          className={iconClass}
          transform={`translate(${cx - box / 2} ${cy - box / 2}) scale(${box / 24})`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {HEX_ICONS[icon]}
        </g>
      )}
    </g>
  );
}

/* Nid d'abeille d'icones medicales — motif plat inspire du logo et de la maquette */
function Honeycomb() {
  return (
    <svg viewBox="0 0 520 396" className="h-auto w-full" role="img" aria-label="Illustration medicale en hexagones">
      {/* rangee 1 */}
      <Hex cx={211} cy={64} r={56} className="fill-brand-500" icon="pulse" />
      <Hex cx={308} cy={64} r={56} className="fill-brand-800" icon="shieldCross" />
      <Hex cx={405} cy={64} r={56} className="fill-brand-200" icon="bandage" iconClass="text-brand-800" />
      {/* rangee 2 */}
      <Hex cx={162.5} cy={148} r={56} className="fill-brand-100" icon="flask" iconClass="text-brand-600" />
      <Hex cx={259.5} cy={148} r={56} className="fill-white stroke-brand-300" strokeWidth={2.5} icon="capsule" iconClass="text-brand-500" />
      <Hex cx={356.5} cy={148} r={56} className="fill-brand-400" icon="syringe" />
      <Hex cx={453.5} cy={148} r={56} className="fill-brand-50" />
      {/* rangee 3 */}
      <Hex cx={211} cy={232} r={56} className="fill-brand-900" icon="firstAid" />
      <Hex cx={308} cy={232} r={56} className="fill-brand-300" icon="clipboard" iconClass="text-brand-900" />
      <Hex cx={405} cy={232} r={56} className="fill-white stroke-brand-200" strokeWidth={2.5} icon="thermometer" iconClass="text-brand-500" />
      {/* rangee 4 */}
      <Hex cx={259.5} cy={316} r={56} className="fill-brand-500" icon="crossBold" />
      <Hex cx={356.5} cy={316} r={56} className="fill-brand-100" icon="heart" iconClass="text-brand-600" />
      {/* hexagones decoratifs */}
      <Hex cx={120} cy={30} r={15} className="fill-none stroke-brand-300" strokeWidth={2} />
      <Hex cx={492} cy={40} r={13} className="fill-none stroke-brand-200" strokeWidth={2} />
      <Hex cx={108} cy={236} r={9} className="fill-brand-300" />
      <Hex cx={478} cy={306} r={19} className="fill-none stroke-brand-300" strokeWidth={2} />
    </svg>
  );
}

/* Version mobile : un bandeau compact de 4 hexagones en zigzag */
function HoneycombMobile() {
  return (
    <svg viewBox="0 0 284 108" className="mx-auto h-auto w-full max-w-[300px]" role="img" aria-label="Illustration medicale en hexagones">
      <Hex cx={40} cy={42} r={32} className="fill-brand-500" icon="pulse" />
      <Hex cx={108} cy={66} r={32} className="fill-brand-800" icon="shieldCross" />
      <Hex cx={176} cy={42} r={32} className="fill-white stroke-brand-300" strokeWidth={2} icon="capsule" iconClass="text-brand-500" />
      <Hex cx={244} cy={66} r={32} className="fill-brand-100" icon="heart" iconClass="text-brand-600" />
      <Hex cx={270} cy={16} r={9} className="fill-none stroke-brand-300" strokeWidth={2} />
      <Hex cx={12} cy={90} r={7} className="fill-brand-300" />
    </svg>
  );
}

/* Grille de points decorative (motif flat de la maquette) */
function Dots({ className }: { className: string }) {
  return (
    <div className={`pointer-events-none grid w-fit grid-cols-8 gap-1.5 ${className}`} aria-hidden>
      {Array.from({ length: 32 }).map((_, i) => (
        <span key={i} className="h-1 w-1 rounded-full bg-brand-200" />
      ))}
    </div>
  );
}

/* Couronne du logo — rappel de la signature "la couronne de votre sante" */
function IconCrown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M3 8.2l4.2 3.1L12 5l4.8 6.3L21 8.2l-1.7 9.3H4.7L3 8.2z" />
    </svg>
  );
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

/* Pastille hexagonale derriere les icones de la barre d'avantages */
function HexChip({ children, className = "h-11 w-11" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`relative flex shrink-0 items-center justify-center text-brand-700 ${className}`}>
      <svg viewBox="0 0 44 48" className="absolute inset-0 h-full w-full" aria-hidden>
        <polygon points={hexPoints(22, 24, 21)} className="fill-brand-50" />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

const features = [
  { icon: <IconShield />, title: "Produits certifies", sub: "Qualite garantie" },
  { icon: <IconTruck />, title: "Livraison 58 wilayas", sub: "Partout en Algerie" },
  { icon: <IconWallet />, title: "Paiement a la livraison", sub: "Sans avance" },
];

export function Hero() {
  return (
    <section className="relative mb-7 overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/60">
      <Dots className="absolute right-8 top-8 hidden sm:grid" />

      <div className="grid items-center gap-7 p-6 sm:gap-10 sm:p-10 lg:grid-cols-[1.05fr_1fr]">
        {/* GAUCHE — texte (centre sur mobile, aligne a gauche sur grand ecran) */}
        <div className="relative z-10 text-center lg:text-left">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-500">
            <IconCrown className="h-4 w-4" />
            La couronne de votre sante
          </span>

          <h1 className="mt-4 font-extrabold uppercase leading-[0.95] tracking-tight">
            <span className="block text-[2rem] text-brand-900 sm:text-5xl">Pharmacie</span>
            <span className="block text-[2rem] text-brand-500 sm:text-5xl">Paramedicale</span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-500 lg:mx-0">
            Tout le materiel paramedical dont vous avez besoin, livre partout en Algerie.
          </p>

          <div className="mt-6 flex justify-center lg:justify-start">
            <button
              type="button"
              onClick={scrollToCatalogue}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-800 sm:w-auto"
            >
              Voir nos produits
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <Dots className="mt-9 hidden lg:grid" />
        </div>

        {/* DROITE — nid d'abeille complet (tablette/desktop), bandeau compact sur mobile */}
        <div className="relative mx-auto hidden w-full max-w-[520px] sm:block">
          <Honeycomb />
        </div>
        <div className="sm:hidden">
          <HoneycombMobile />
        </div>
      </div>

      {/* barre d'avantages — compacte en 3 colonnes sur mobile, en ligne sur grand ecran */}
      <div className="grid grid-cols-3 border-t border-slate-100">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex flex-col items-center gap-1.5 px-2 py-3.5 text-center sm:flex-row sm:gap-3 sm:px-6 sm:py-4 sm:text-left"
          >
            <HexChip className="h-9 w-9 sm:h-11 sm:w-11">{f.icon}</HexChip>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold text-brand-900 sm:text-sm">{f.title}</p>
              <p className="hidden text-xs text-slate-500 sm:block">{f.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
