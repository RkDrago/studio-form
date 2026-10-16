"use client";

import Image from "next/image";
import { useMemo, useRef, useState, type DragEvent } from "react";
import { bulkUpload, CONCURRENCY, type UploadItem } from "@/lib/bulkUpload";
import type { Project } from "@/lib/types";

type Notify = (kind: "ok" | "err", text: string) => void;

interface QueueRow extends UploadItem {
  localUrl: string;
}

export default function BulkMediaTab({
  projects,
  onCommitted,
  notify,
}: {
  projects: Project[];
  onCommitted: () => void | Promise<void>;
  notify: Notify;
}) {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [projectId, setProjectId] = useState<string>(projects[0]?.id ?? "");
  const [running, setRunning] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const summary = useMemo(() => {
    const done = rows.filter((r) => r.status === "done").length;
    const failed = rows.filter((r) => r.status === "error").length;
    const active = rows.filter((r) => r.status === "uploading").length;
    const overall =
      rows.length === 0
        ? 0
        : Math.round(rows.reduce((sum, r) => sum + r.progress, 0) / rows.length);
    return { done, failed, active, overall };
  }, [rows]);

  function addFiles(files: FileList | File[] | null) {
    if (!files) return;
    const accepted = Array.from(files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );
    if (accepted.length === 0) {
      notify("err", "Only image/* and video/* files are accepted.");
      return;
    }
    const skipped = files.length - accepted.length;
    if (skipped > 0) notify("err", `${skipped} non-media file(s) skipped.`);

    setRows((prev) => [
      ...prev,
      ...accepted.map<QueueRow>((f) => ({
        file: f,
        progress: 0,
        status: "queued",
        localUrl: URL.createObjectURL(f),
      })),
    ]);
  }

  async function startUpload() {
    const pending = rows.filter((r) => r.status === "queued" || r.status === "error");
    if (pending.length === 0) {
      notify("err", "Nothing queued to upload.");
      return;
    }
    setRunning(true);
    try {
      const files = pending.map((r) => r.file);
      const globalIndex = pending.map((r) => rows.indexOf(r));

      await bulkUpload(files, (i, patch) => {
        setRows((prev) => {
          const next = [...prev];
          const target = globalIndex[i];
          next[target] = { ...next[target], ...patch };
          return next;
        });
      });

      notify("ok", `Uploaded ${files.length} file(s) to the temp store.`);
    } finally {
      setRunning(false);
    }
  }

  async function commitToProject() {
    if (!projectId) {
      notify("err", "Choose a project to attach the media to.");
      return;
    }
    const uploaded = rows.filter((r) => r.status === "done" && r.url);
    if (uploaded.length === 0) {
      notify("err", "Upload the queue first.");
      return;
    }

    setCommitting(true);
    try {
      const res = await fetch("/api/media/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          urls: uploaded.map((r) => ({
            url: r.url as string,
            type: r.file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
            size: r.file.size,
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const body = await res.json();
      notify("ok", `${body.created} media record(s) linked to the project.`);
      setRows([]);
      await onCommitted();
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Could not attach media");
    } finally {
      setCommitting(false);
    }
  }

  async function optimize() {
    if (!projectId) return;
    const res = await fetch("/api/media/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    const body = await res.json();
    notify("ok", `Optimize job accepted for ${body.queued ?? 0} image(s) (stubbed in temp mode).`);
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-8">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => input.current?.click()}
        className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center transition-colors ${
          dragging ? "border-brass bg-brass/5" : "border-paper-line hover:border-brass"
        }`}
      >
        <p className="font-display text-2xl">Drop 200+ files here</p>
        <p className="mt-3 max-w-md text-sm text-ink-muted">
          Images and video upload {CONCURRENCY} at a time straight to storage -
          the server never buffers the files, so size is not a problem.
        </p>
        <input
          ref={input}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
        <span className="btn-ghost mt-6 text-[11px]">Choose files</span>
      </div>

      {rows.length > 0 && (
        <>
          <div className="card-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6 text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                <span>{rows.length} queued</span>
                <span className="text-brass">{summary.done} done</span>
                {summary.active > 0 && <span>{summary.active} uploading</span>}
                {summary.failed > 0 && (
                  <span className="text-red-600">{summary.failed} failed</span>
                )}
                <span>{summary.overall}% overall</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={startUpload} disabled={running} className="btn-primary !py-2 text-[11px]">
                  {running ? "Uploading…" : "Start upload"}
                </button>
                <button onClick={() => setRows([])} disabled={running} className="btn-ghost !py-2 text-[11px]">
                  Clear queue
                </button>
              </div>
            </div>

            <div className="mt-5 h-1 overflow-hidden rounded-full bg-paper-line">
              <div
                className="h-full bg-brass transition-all duration-300"
                style={{ width: `${summary.overall}%` }}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-paper-line pt-6">
              <div className="min-w-[240px] flex-1">
                <label className="label">Assign uploaded media to</label>
                <select
                  className="field"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  {projects.length === 0 && <option value="">No projects yet</option>}
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={commitToProject}
                disabled={committing || summary.done === 0}
                className="btn-primary !py-3"
              >
                {committing ? "Linking…" : `Attach ${summary.done} file(s)`}
              </button>
              <button onClick={optimize} className="btn-ghost !py-3 text-[11px]">
                Queue WebP optimize
              </button>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r, i) => (
              <li
                key={`${r.file.name}-${i}`}
                className="flex items-center gap-4 rounded-xl border border-paper-line bg-paper-soft p-3"
              >
                <div className="relative h-14 w-16 flex-none overflow-hidden rounded-md bg-paper-soft">
                  {r.file.type.startsWith("image/") ? (
                    <Image
                      src={r.localUrl}
                      alt=""
                      fill
                      unoptimized
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[0.14em] text-ink-muted">
                      Video
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-ink">{r.file.name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                    {(r.file.size / 1024 / 1024).toFixed(1)} MB ·{" "}
                    <span
                      className={
                        r.status === "done"
                          ? "text-brass"
                          : r.status === "error"
                            ? "text-red-600"
                            : undefined
                      }
                    >
                      {r.status}
                    </span>
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-paper-line">
                    <div
                      className={`h-full transition-all ${
                        r.status === "error" ? "bg-red-500" : "bg-brass"
                      }`}
                      style={{ width: `${r.progress}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
