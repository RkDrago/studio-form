"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, type Project } from "@/lib/types";

type Notify = (kind: "ok" | "err", text: string) => void;

interface Draft {
  title: string;
  category: Project["category"];
  location: string;
  clientName: string;
  sizeSqft: string;
  year: string;
  description: string;
  status: Project["status"];
  featured: boolean;
}

export default function ContentManagerTab({
  projects,
  onChanged,
  notify,
}: {
  projects: Project[];
  onChanged: () => void | Promise<void>;
  notify: Notify;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter((p) =>
      [p.title, p.clientName, p.location, p.category, p.status, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [projects, query]);

  function openEditor(p: Project) {
    setEditing(p.slug);
    setDraft({
      title: p.title,
      category: p.category,
      location: p.location,
      clientName: p.clientName,
      sizeSqft: p.sizeSqft,
      year: p.year,
      description: p.description,
      status: p.status,
      featured: p.featured,
    });
  }

  async function patch(slug: string, body: object, label: string) {
    setBusy(slug);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error ?? `Request failed (${res.status})`);
      }
      notify("ok", label);
      await onChanged();
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  async function remove(p: Project) {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    setBusy(p.slug);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(p.slug)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      notify("ok", `Deleted "${p.title}".`);
      await onChanged();
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      source: "temp-data",
      count: projects.length,
      projects,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studioform-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("ok", `Exported ${projects.length} projects as JSON.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <input
          className="field max-w-sm flex-1"
          placeholder="Search by title, client, city, tag…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={exportJson} className="btn-ghost text-[11px]">
          Export JSON
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink text-[10px] uppercase tracking-[0.16em] text-sand-muted">
            <tr>
              <th className="px-5 py-4 font-normal">Project</th>
              <th className="hidden px-5 py-4 font-normal md:table-cell">Sector</th>
              <th className="hidden px-5 py-4 font-normal lg:table-cell">Client</th>
              <th className="px-5 py-4 font-normal">Status</th>
              <th className="px-5 py-4 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-ink-line bg-ink-soft/60">
                <td className="px-5 py-4">
                  <p className="text-sand">{p.title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-sand-muted">
                    {p.location} · {p.media.length} assets · {p.year}
                  </p>
                </td>
                <td className="hidden px-5 py-4 text-sand-muted md:table-cell">
                  {p.category}
                </td>
                <td className="hidden px-5 py-4 text-sand-muted lg:table-cell">
                  {p.clientName}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.14em] ${
                      p.status === "PUBLISHED"
                        ? "bg-brass/15 text-brass"
                        : "bg-ink-line text-sand-muted"
                    }`}
                  >
                    {p.status}
                  </span>
                  {p.featured && (
                    <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-brass">
                      ★
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap justify-end gap-3 text-[10px] uppercase tracking-[0.14em]">
                    <button
                      disabled={busy === p.slug}
                      onClick={() => openEditor(p)}
                      className="text-sand-muted transition-colors hover:text-brass"
                    >
                      Edit
                    </button>
                    <button
                      disabled={busy === p.slug}
                      onClick={() =>
                        patch(
                          p.slug,
                          { status: p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
                          p.status === "PUBLISHED" ? "Moved to draft." : "Published.",
                        )
                      }
                      className="text-sand-muted transition-colors hover:text-brass"
                    >
                      {p.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      disabled={busy === p.slug}
                      onClick={() =>
                        patch(
                          p.slug,
                          { featured: !p.featured },
                          p.featured ? "Removed from featured." : "Marked as featured.",
                        )
                      }
                      className="text-sand-muted transition-colors hover:text-brass"
                    >
                      {p.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button
                      disabled={busy === p.slug}
                      onClick={() => remove(p)}
                      className="text-red-400/80 transition-colors hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr className="border-t border-ink-line bg-ink-soft/40">
                <td colSpan={5} className="px-5 py-12 text-center text-sand-muted">
                  No projects match that search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && draft && (
        <div className="card-surface p-8">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Editing · {editing}</p>
            <button
              onClick={() => {
                setEditing(null);
                setDraft(null);
              }}
              className="text-[11px] uppercase tracking-[0.16em] text-sand-muted hover:text-brass"
            >
              Close
            </button>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Title</label>
              <input
                className="field"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Sector</label>
              <select
                className="field"
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value as Project["category"] })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Client</label>
              <input
                className="field"
                value={draft.clientName}
                onChange={(e) => setDraft({ ...draft, clientName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                className="field"
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Area (sq ft)</label>
                <input
                  className="field"
                  value={draft.sizeSqft}
                  onChange={(e) => setDraft({ ...draft, sizeSqft: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Year</label>
                <input
                  className="field"
                  value={draft.year}
                  onChange={(e) => setDraft({ ...draft, year: e.target.value })}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea
                className="field min-h-[120px] resize-y"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-ink-line pt-6">
            <button
              onClick={() => patch(editing, draft, "Project saved.")}
              disabled={busy === editing}
              className="btn-primary"
            >
              {busy === editing ? "Saving…" : "Save changes"}
            </button>
            <label className="flex items-center gap-3 text-sm text-sand-muted">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brass"
                checked={draft.featured}
                onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
              />
              Featured
            </label>
            <select
              className="field !w-auto"
              value={draft.status}
              onChange={(e) =>
                setDraft({ ...draft, status: e.target.value as Project["status"] })
              }
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
