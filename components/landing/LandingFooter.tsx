import { WRAP } from "./primitives";
import { DOCS_URL } from "@/lib/const/DOCS_URL";
import { FEATUREBASE_URL } from "@/lib/const/FEATUREBASE_URL";

type FooterLink = { label: string; href: string; external?: boolean };
type FooterCol = { h: string; links: FooterLink[] };

const FOOTER_COLS: FooterCol[] = [
  {
    h: "Product",
    links: [
      { label: "Docs",          href: DOCS_URL                 },
      { label: "CLI reference", href: `${DOCS_URL}/cli`        },
      { label: "Components",    href: `${DOCS_URL}/components` },
      { label: "Pricing",       href: "/pricing"     },
      { label: "Demo",          href: "/demo"        },
    ],
  },
  {
    h: "Build",
    links: [
      { label: "Quickstart",  href: `${DOCS_URL}/quickstart` },
      { label: "Tool files",  href: `${DOCS_URL}/tools`      },
      { label: "AI setup",    href: `${DOCS_URL}/ai-setup`   },
      { label: "CLI",         href: `${DOCS_URL}/cli`        },
    ],
  },
  {
    h: "Company",
    links: [
      { label: "Contact",  href: "/contact"                       },
      { label: "Feedback", href: FEATUREBASE_URL, external: true  },
      { label: "Privacy",  href: "/privacy"                       },
      { label: "Terms",    href: "/terms"                         },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border pt-16 pb-10 text-xs text-muted-foreground">
      <div className={WRAP}>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-primary">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M11 8 L20 16 L11 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="font-mono font-semibold text-foreground text-sm">betteragent</span>
            </div>
            <p className="font-sans text-[13px] leading-[1.55] text-muted-foreground max-w-[260px] m-0">
              Hosted agent platform for web apps. Pick a layout, sync your routes, drop in the components.
            </p>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.h}>
              <h5 className="font-mono text-[11px] tracking-[0.06em] uppercase text-foreground m-0 mb-3 font-medium">
                {col.h}
              </h5>
              {col.links.map(({ label, href, external }) => (
                <a
                  key={label}
                  href={href}
                  className="text-muted-foreground no-underline block py-1 font-mono"
                  {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-10 mt-12 border-t border-border font-mono">
          <span>© 2026 BetterAgent</span>
          <span className="inline-flex items-center gap-3.5">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms",   href: "/terms"   },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="text-muted-foreground no-underline">
                {label}
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
