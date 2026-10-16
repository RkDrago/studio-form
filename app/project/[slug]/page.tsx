import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProjectGallery from "@/components/ProjectGallery";
import Reveal from "@/components/Reveal";
import { getStats, getProjectBySlug, listProjects } from "@/lib/data";

export const revalidate = 60;

export function generateStaticParams() {
  return listProjects({ status: "PUBLISHED" }).map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getProjectBySlug(params.slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.description.slice(0, 155),
    openGraph: {
      title: project.title,
      description: project.description.slice(0, 155),
      images: [{ url: project.coverUrl }],
    },
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);
  if (!project) notFound();

  const others = listProjects({ status: "PUBLISHED" })
    .filter((p) => p.slug !== project.slug)
    .slice(0, 3);

  return (
    <article className="pb-24">
      <header className="relative h-[62vh] min-h-[420px] w-full overflow-hidden border-b border-ink-line">
        <Image
          src={project.coverUrl}
          alt={project.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10" />

        <div className="shell absolute inset-x-0 bottom-0 pb-12">
          <Link
            href="/#work"
            className="text-[11px] uppercase tracking-[0.18em] text-sand-muted transition-colors hover:text-brass"
          >
            ← Back to work
          </Link>
          <p className="eyebrow mt-6">{project.category}</p>
          <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.05]">
            {project.title}
          </h1>
        </div>
      </header>

      <div className="shell grid gap-16 py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="text-[17px] leading-relaxed text-sand/90">
              {project.description}
            </p>
          </Reveal>

          <div className="mt-14">
            <ProjectGallery title={project.title} media={project.media} />
          </div>
        </div>

        <aside className="lg:col-span-5 lg:pl-10">
          <Reveal delay={0.1}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-7 border-t border-ink-line pt-8">
              {[
                ["Client", project.clientName],
                ["Location", project.location],
                ["Area", `${project.sizeSqft} sq ft`],
                ["Year", project.year],
                ["Status", project.status],
                ["Assets", `${project.media.length} files`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-sand-muted">
                    {k}
                  </dt>
                  <dd className="mt-2 text-sm">{v}</dd>
                </div>
              ))}
            </dl>

            {project.scope.length > 0 && (
              <div className="mt-10">
                <p className="eyebrow">Scope</p>
                <ul className="mt-5 space-y-3">
                  {project.scope.map((s) => (
                    <li
                      key={s}
                      className="flex items-center gap-3 text-sm text-sand-muted"
                    >
                      <span className="h-1 w-1 rounded-full bg-brass" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.materials.length > 0 && (
              <div className="mt-10">
                <p className="eyebrow">Material Palette</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {project.materials.map((m) => (
                    <li
                      key={m}
                      className="rounded-full bg-brass/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-brass"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.tags.length > 0 && (
              <div className="mt-10">
                <p className="eyebrow">Tags</p>
                <p className="mt-4 text-xs uppercase tracking-[0.14em] text-sand-muted">
                  {project.tags.join(" · ")}
                </p>
              </div>
            )}

            <a href="mailto:studio@studioform.in" className="btn-primary mt-12 w-full">
              Start a similar project
            </a>
          </Reveal>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="shell border-t border-ink-line pt-16">
          <p className="eyebrow">More Work</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <Link
                key={p.id}
                href={`/project/${p.slug}`}
                className="group relative block overflow-hidden rounded-2xl border border-ink-line grain"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={p.coverUrl}
                    alt={p.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-brass">
                    {p.category}
                  </p>
                  <h3 className="mt-2 font-display text-lg">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
