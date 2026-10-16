import Hero from "@/components/Hero";
import PortfolioGrid from "@/components/PortfolioGrid";
import Reveal from "@/components/Reveal";
import { getStats, listProjects } from "@/lib/data";

// ISR: matches the kit's 60s homepage revalidation target.
export const revalidate = 60;

const CAPABILITIES = [
  {
    title: "Workplace Strategy",
    copy: "Headcount modelling, zoning and acoustic planning that survives a growth spurt.",
  },
  {
    title: "Interior Architecture",
    copy: "Drawings, joinery details and site supervision from concept to snag list.",
  },
  {
    title: "FF&E & Styling",
    copy: "Specification, procurement and install for furniture, lighting and art.",
  },
  {
    title: "Delivery Management",
    copy: "Vendor coordination, programme control and cost tracking to handover.",
  },
];

export default async function HomePage() {
  const projects = listProjects({ status: "PUBLISHED" }).filter(
    (p) => p.status === "PUBLISHED",
  );
  const stats = getStats();
  const featured = projects.find((p) => p.featured) ?? projects[0];

  return (
    <>
      <Hero featured={featured} stats={stats} />

      <PortfolioGrid initialProjects={projects} />

      <section className="shell py-20">
        <Reveal>
          <p className="eyebrow">Capabilities</p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(1.9rem,3.4vw,3rem)] leading-tight">
            One studio accountable from first sketch to final snag
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink-line bg-ink-line sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06}>
              <div className="h-full bg-ink-soft p-8">
                <span className="text-[11px] tracking-eyebrow text-brass">
                  0{i + 1}
                </span>
                <h3 className="mt-6 font-display text-xl">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-sand-muted">
                  {c.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shell pb-24">
        <Reveal>
          <div className="card-surface relative overflow-hidden p-10 sm:p-14 grain">
            <p className="eyebrow">B2B Enquiries</p>
            <h2 className="mt-4 max-w-2xl font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-tight">
              Planning a fit-out? Send us the brief and the floor plate.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-sand-muted">
              We respond with a capability pack, indicative programme and
              ballpark cost per square foot within two working days.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="mailto:studio@studioform.in" className="btn-primary">
                studio@studioform.in
              </a>
              <a href="tel:+912235009100" className="btn-ghost">
                +91 22 3500 9100
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
