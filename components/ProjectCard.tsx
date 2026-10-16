"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Project } from "@/lib/types";

export default function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (project: Project) => void;
}) {
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.35) }}
      onClick={() => onOpen(project)}
      className="group relative block w-full overflow-hidden rounded-2xl border border-ink-line bg-ink-soft text-left grain"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={project.coverUrl}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-transparent opacity-90" />

        <span className="absolute left-5 top-5 rounded-full border border-brass/40 bg-ink/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-brass backdrop-blur">
          {project.category}
        </span>

        {project.featured && (
          <span className="absolute right-5 top-5 text-[10px] uppercase tracking-[0.18em] text-sand-muted">
            Featured
          </span>
        )}

        {project.status === "DRAFT" && (
          <span className="absolute right-5 bottom-5 rounded-full bg-brass px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">
            Draft
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="font-display text-xl leading-snug text-sand">
          {project.title}
        </h3>
        <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-sand-muted">
          {project.location} · {project.sizeSqft} sq ft
        </p>

        <div className="mt-4 flex max-h-0 items-center gap-3 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-12 group-hover:opacity-100">
          <span className="text-[11px] uppercase tracking-[0.18em] text-brass">
            View project
          </span>
          <span className="h-px flex-1 bg-brass/40" />
          <span className="text-[11px] text-sand-muted">
            {project.media.length} assets
          </span>
        </div>
      </div>
    </motion.button>
  );
}
