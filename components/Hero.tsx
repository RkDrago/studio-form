import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";
import Reveal from "./Reveal";

export default function Hero({
  featured,
  stats,
}: {
  featured?: Project;
  stats: { projects: number; media: number; byCategory: Record<string, number> };
}) {
  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pt-24">
      <div className="shell">
        <div className="grid items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow">Interior Architecture · Est. 2011 · Mumbai</p>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="mt-6 font-display text-[clamp(2.6rem,6.4vw,5.2rem)] leading-[1.02] text-balance">
                Spaces with
                <span className="text-brass"> weight</span>, built for
                <br className="hidden sm:block" /> the way business works.
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                STUDIOFORM designs and delivers commercial workplaces,
                hospitality venues, retail flagships and residential towers -
                from strategy and space planning through bespoke joinery,
                lighting and styling. One studio, one accountable team, every
                drawer documented.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="#work" className="btn-primary">
                  View selected work
                </Link>
                <Link href="/admin" className="btn-ghost">
                  Open content studio
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-paper-line pt-8">
                <div>
                  <dt className="text-[10px] uppercase tracking-eyebrow text-ink-muted">
                    Projects
                  </dt>
                  <dd className="mt-2 font-display text-3xl">{stats.projects}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-eyebrow text-ink-muted">
                    Media assets
                  </dt>
                  <dd className="mt-2 font-display text-3xl">{stats.media}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-eyebrow text-ink-muted">
                    Sectors
                  </dt>
                  <dd className="mt-2 font-display text-3xl">
                    {Object.keys(stats.byCategory).length}
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>

          {featured && (
            <Reveal delay={0.2} className="lg:col-span-5">
              <Link
                href={`/project/${featured.slug}`}
                className="group relative block overflow-hidden rounded-3xl border border-paper-line grain"
              >
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={featured.coverUrl}
                    alt={featured.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/5" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="eyebrow text-brass-light">
                    Featured · {featured.category}
                  </p>
                  <h2 className="mt-3 font-display text-2xl leading-snug text-white">
                    {featured.title}
                  </h2>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/70">
                    {featured.location} · {featured.sizeSqft} sq ft · {featured.year}
                  </p>
                </div>
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
