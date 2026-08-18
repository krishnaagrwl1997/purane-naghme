import { SITE } from "@/app/lib/site";

/* The little paper note taped above the deck. Set
   SITE.howIMadeThis.href to "" to remove it entirely. */
export default function HowIMadeThis() {
  const { label, href } = SITE.howIMadeThis;
  if (!href) return null;

  const external = href.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      className="group inline-flex items-center gap-2 rounded-full bg-[#faf6ec] py-1.5 pr-4 pl-2 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.7)] ring-1 ring-black/10 transition hover:-translate-y-px hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e03127]">
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 translate-x-px" fill="white" aria-hidden="true">
          <path d="M2 1.4a.6.6 0 0 1 .9-.5l7.2 4.6a.6.6 0 0 1 0 1L2.9 11.1a.6.6 0 0 1-.9-.5V1.4Z" />
        </svg>
      </span>
      <span className="font-hand text-[17px] leading-none text-[#2b2317] italic">
        {label}
      </span>
    </a>
  );
}
