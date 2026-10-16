"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/lib/types";
import AddProjectTab from "./admin/AddProjectTab";
import BulkMediaTab from "./admin/BulkMediaTab";
import ContentManagerTab from "./admin/ContentManagerTab";

type TabKey = "add" | "bulk" | "manage";

interface Stats {
  projects: number;
  published: number;
  draft: number;
  media: number;
  images: number;
  videos: number;
  featured: number;
  byCategory: Record<string, number>;
}

const TABS: { key: TabKey; label: string; hint: string }[] = [
  { key: "add", label: "Add Project", hint: "Form + drag-drop cover, gallery, video" },
  { key: "bulk", label: "Bulk Media", hint: "200+ files, direct upload with progress" },
  { key: "manage", label: "Content Manager", hint: "Search, edit, delete, export JSON" },
];

export default function AdminStudio({
  initialProjects,
  initialStats,
}: {
  initialProjects: Project[];
  initialStats: Stats;
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [tab, setTab] = useState<TabKey>("add");
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null,
  );

  const notify = useCallback((kind: "ok" | "err", text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const reload = useCallback(async () => {
    const res = await fetch("/api/projects", { cache: "no-store" });
    const json = await res.json();
    if (Array.isArray(json.projects)) setProjects(json.projects);
    if (json.stats) setStats(json.stats);
  }, []);

  return (
    <div className="shell py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">STUDIOFORM · Content Studio</p>
          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] leading-tight">
            Upload studio
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sand-muted">
            Manage the portfolio, drag in bulk media and export content - all
            served from the temp data store the API routes use.
          </p>
        </div>
        <button onClick={reload} className="btn-ghost text-[11px]">
          Refresh data
        </button>
      </div>

      <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-line bg-ink-line sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Projects", stats.projects],
          ["Published", stats.published],
          ["Drafts", stats.draft],
          ["Featured", stats.featured],
          ["Images", stats.images],
          ["Videos", stats.videos],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-ink-soft px-6 py-6">
            <dt className="text-[10px] uppercase tracking-[0.16em] text-sand-muted">
              {label}
            </dt>
            <dd className="mt-3 font-display text-3xl">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-14 grid gap-10 lg:grid-cols-12">
        <nav className="lg:col-span-3">
          <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-3 lg:overflow-visible">
            {TABS.map((t) => (
              <li key={t.key} className="flex-none lg:w-full">
                <button
                  onClick={() => setTab(t.key)}
                  className={`w-full rounded-xl border px-5 py-4 text-left transition-all duration-300 ${
                    tab === t.key
                      ? "border-brass bg-brass/10"
                      : "border-ink-line hover:border-sand-muted/50"
                  }`}
                >
                  <span
                    className={`block text-[12px] uppercase tracking-[0.14em] ${
                      tab === t.key ? "text-brass" : "text-sand"
                    }`}
                  >
                    {t.label}
                  </span>
                  <span className="mt-1 hidden text-[11px] leading-snug text-sand-muted lg:block">
                    {t.hint}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              {tab === "add" && (
                <AddProjectTab
                  onCreated={reload}
                  notify={notify}
                />
              )}
              {tab === "bulk" && (
                <BulkMediaTab
                  projects={projects}
                  onCommitted={reload}
                  notify={notify}
                />
              )}
              {tab === "manage" && (
                <ContentManagerTab
                  projects={projects}
                  onChanged={reload}
                  notify={notify}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border px-6 py-3 text-sm backdrop-blur ${
              toast.kind === "ok"
                ? "border-brass/50 bg-brass/15 text-brass"
                : "border-red-500/50 bg-red-500/10 text-red-300"
            }`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
