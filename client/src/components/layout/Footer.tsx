import { IconFacebook, IconInstagram, IconTiktok } from "../ui/icons";

// Coordonnees affichees dans le footer — a remplacer par les vraies valeurs.
// phoneHref : format international sans espaces (pour le lien tel:).
const CONTACT = {
  phoneHref: "+213562863630",
  phoneLabel: "+213 562 863 630",
  email: "contact@tadjpharm.dz",
};

const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/tadjpharm", Icon: IconFacebook },
  { label: "Instagram", href: "https://www.instagram.com/tadj_pharm", Icon: IconInstagram },
  { label: "TikTok", href: "https://www.tiktok.com/@tadj_pharm", Icon: IconTiktok },
];

function IconPhone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function IconMail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        {/* Marque */}
        <div className="text-center md:text-left">
          <p className="text-lg font-extrabold tracking-tight text-slate-900">
            Tadj<span className="text-brand-500">Pharm</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">Materiel paramedical livre partout en Algerie.</p>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center gap-2.5 sm:flex-row sm:gap-5">
          <a
            href={`tel:${CONTACT.phoneHref}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-600"
          >
            <IconPhone className="h-4 w-4 text-brand-500" />
            {CONTACT.phoneLabel}
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-600"
          >
            <IconMail className="h-4 w-4 text-brand-500" />
            {CONTACT.email}
          </a>
        </div>

        {/* Reseaux sociaux */}
        <div className="flex items-center gap-2">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-brand-500 hover:text-white"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} TadjPharm. Commande sans compte, confirmation par telephone.</p>
      </div>
    </footer>
  );
}
