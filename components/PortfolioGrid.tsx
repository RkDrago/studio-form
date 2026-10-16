"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CATEGORIES, type Project } from "@/lib/types";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";

const FILTERS = ["All", ...CATEGORIES] as const;

export default function PortfolioGrid({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/projects?status=PUBLISHED`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (Array.isArray(json.projects)) setProjects(json.projects);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (p.status !== "PUBLISHED") return false;
      if (category !== "All" && p.category !== category) return false;
      if (!needle) return true;
      return [p.title, p.location, p.clientName, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [projects, category, query]);

  return (
    <section id="work" className="shell scroll-mt-24 py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Selected Work</p>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,3.4vw,3rem)] leading-tight">
            {filtered.length} projects across four sectors
          </h2>
        </div>

        <div className="flex w-full max-w-md items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, clients, tags…"
            className="field"
            aria-label="Search projects"
          />
          <button
            onClick={refetch}
            disabled={refreshing}
            className="btn-ghost !px-4 !py-3 text-[11px]"
            title="Re-pull projects from /api/projects"
          >
            {refreshing ? "…" : "Sync"}
          </button>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3" id="categories">
        {FILTERS.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-5 py-2 text-[11px] uppercase tracking-[0.16em] transition-all duration-300 ${
              category === c
                ? "border-brass bg-brass text-white"
                : "border-paper-line text-ink-muted hover:border-brass hover:text-brass"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} onOpen={setSelected} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="card-surface mt-12 p-12 text-center">
          <p className="font-display text-xl">Nothing in this selection yet</p>
          <p className="mt-3 text-sm text-ink-muted">
            Adjust the sector filter or add a project from the{" "}
            <Link href="/admin" className="text-brass underline">
              content studio
            </Link>
            .
          </p>
        </div>
      )}

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
