import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer id="studio" className="mt-24 border-t border-paper-line">
      <div className="shell grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl tracking-[0.2em]">STUDIOFORM</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
            A B2B interior architecture practice designing workplaces,
            hospitality venues, retail flagships and residential towers. We
            take projects from strategy through to styling.
          </p>
        </div>

        <div>
          <p className="eyebrow">Studio</p>
          <ul className="mt-5 space-y-3 text-sm text-ink-muted">
            <li>Unit 04, Laxmi Woollen Mills</li>
            <li>Shakti Mills Lane, Mumbai 400011</li>
            <li>
              <a
                href="mailto:studio@studioform.in"
                className="transition-colors hover:text-brass"
              >
                studio@studioform.in
              </a>
            </li>
            <li>
              <a href="tel:+912235009100" className="transition-colors hover:text-brass">
                +91 22 3500 9100
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Explore</p>
          <ul className="mt-5 space-y-3 text-sm text-ink-muted">
            <li>
              <Link href="/#work" className="transition-colors hover:text-brass">
                Selected Work
              </Link>
            </li>
            <li>
              <Link href="/#categories" className="transition-colors hover:text-brass">
                Sectors
              </Link>
            </li>
            <li>
              <Link href="/admin" className="transition-colors hover:text-brass">
                Content Studio
              </Link>
            </li>
            <li>
              <Link href="/api/projects" className="transition-colors hover:text-brass">
                Public API
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell flex flex-col gap-3 border-t border-paper-line py-6 text-[11px] uppercase tracking-[0.16em] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} STUDIOFORM. All rights reserved.</span>
        <span>Running on temp data · dev kit v1.0.0</span>
      </div>
    </footer>
  );
}
