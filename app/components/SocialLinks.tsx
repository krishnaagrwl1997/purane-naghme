import { SITE } from "@/app/lib/site";

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M17.53 3h3.05l-6.66 7.61L21.75 21h-6.13l-4.8-6.28L5.32 21H2.26l7.13-8.14L2.25 3h6.28l4.34 5.74L17.53 3Zm-1.07 16.17h1.69L7.62 4.74H5.81l10.65 14.43Z" />
    </svg>
  );
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" />
    </svg>
  );
}

const ICONS = { instagram: InstagramIcon, x: XIcon };

/* Swap the hrefs in app/lib/site.ts — one place, typed. */
export default function SocialLinks() {
  return (
    <nav aria-label="Social links" className="pointer-events-auto flex items-center gap-3">
      {SITE.links.map((link) => {
        const Icon = ICONS[link.icon];
        const external = link.href.startsWith("http");
        return (
          <a
            key={link.label}
            href={link.href}
            aria-label={link.label}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer noopener" : undefined}
            className="flex items-start gap-0.5 text-white/55 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <Icon className="h-[18px] w-[18px]" />
            <ArrowIcon className="h-2.5 w-2.5 opacity-70" />
          </a>
        );
      })}
    </nav>
  );
}
