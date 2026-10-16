"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/lib/types";

export default function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  const gallery = project?.media ?? [];
  const active = gallery[activeIndex];

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 280 }}
            className="relative flex h-full w-full max-w-3xl flex-col overflow-y-auto border-l border-ink-line bg-ink-soft"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-line bg-ink-soft/95 px-6 py-4 backdrop-blur">
              <p className="eyebrow">{project.category} Portfolio</p>
              <div className="flex items-center gap-3">
                <Link
                  href={`/project/${project.slug}`}
                  className="text-[11px] uppercase tracking-[0.16em] text-sand-muted transition-colors hover:text-brass"
                >
                  Full page
                </Link>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-line text-sand-muted transition-colors hover:border-brass hover:text-brass"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="relative aspect-[16/10] w-full bg-ink">
              {active?.type === "VIDEO" ? (
                <video
                  key={active.id}
                  src={active.url}
                  controls
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                active && (
                  <Image
                    key={active.id}
                    src={active.url}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                  />
                )
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-b border-ink-line px-6 py-4">
                {gallery.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveIndex(i)}
                    className={`relative h-16 w-24 flex-none overflow-hidden rounded-md border transition-colors ${
                      i === activeIndex ? "border-brass" : "border-ink-line"
                    }`}
                    aria-label={`Asset ${i + 1}`}
                  >
                    {m.type === "VIDEO" ? (
                      <span className="flex h-full w-full items-center justify-center bg-ink text-[10px] uppercase tracking-[0.16em] text-sand-muted">
                        Video
                      </span>
                    ) : (
                      <Image
                        src={m.url}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="px-8 py-8">
              <h2 className="font-display text-3xl leading-tight">{project.title}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-sand-muted">
                {project.description}
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-ink-line pt-8 sm:grid-cols-3">
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
                <div className="mt-8">
                  <p className="eyebrow">Scope</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.scope.map((s) => (
                      <li
                        key={s}
                        className="rounded-full border border-ink-line px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-sand-muted"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.materials.length > 0 && (
                <div className="mt-8">
                  <p className="eyebrow">Palette</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
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

              <div className="mt-10 flex flex-wrap gap-3 border-t border-ink-line pt-8">
                <a href="mailto:studio@studioform.in" className="btn-primary">
                  Enquire about this project
                </a>
                <Link href="/admin" className="btn-ghost">
                  Manage in Studio
                </Link>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
