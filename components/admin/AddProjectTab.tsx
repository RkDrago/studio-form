"use client";

import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";
import { uploadWithProgress } from "@/lib/bulkUpload";
import { CATEGORIES, type Category } from "@/lib/types";

type Notify = (kind: "ok" | "err", text: string) => void;

interface Uploaded {
  name: string;
  kind: "image" | "video";
  localUrl: string;
  remoteUrl?: string;
  progress: number;
  error?: string;
}

const SAMPLE_COVER =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80";

const EMPTY = {
  title: "",
  category: "Commercial" as Category,
  location: "",
  sizeSqft: "",
  year: String(new Date().getFullYear()),
  clientName: "",
  description: "",
  scope: "",
  materials: "",
  tags: "",
  videoUrl: "",
  featured: false,
  status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
};

export default function AddProjectTab({
  onCreated,
  notify,
}: {
  onCreated: () => void | Promise<void>;
  notify: Notify;
}) {
  const [form, setForm] = useState(EMPTY);
  const [cover, setCover] = useState<Uploaded | null>(null);
  const [gallery, setGallery] = useState<Uploaded[]>([]);
  const [video, setVideo] = useState<Uploaded | null>(null);
  const [saving, setSaving] = useState(false);

  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  // Keep raw Files alongside the preview state so uploads can retry.
  const coverFileRef = useRef<File | null>(null);
  const galleryFilesRef = useRef<File[]>([]);
  const videoFileRef = useRef<File | null>(null);

  const set = (key: keyof typeof EMPTY, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const csv = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  function toUploaded(files: File[], kind: "image" | "video"): Uploaded[] {
    return files.map((f) => ({
      name: f.name,
      kind,
      localUrl: URL.createObjectURL(f),
      progress: 0,
    }));
  }

  async function uploadAll(
    items: Uploaded[],
    files: File[],
    setItems: (next: Uploaded[]) => void,
  ): Promise<string[]> {
    const next = [...items];
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const { url } = await uploadWithProgress(files[i], (p) => {
          next[i] = { ...next[i], progress: p };
          setItems([...next]);
        });
        next[i] = { ...next[i], remoteUrl: url, progress: 100 };
        urls.push(url);
      } catch (e) {
        next[i] = {
          ...next[i],
          error: e instanceof Error ? e.message : "upload failed",
        };
      }
      setItems([...next]);
    }
    return urls;
  }

  async function handleSubmit() {
    if (!form.title || !form.location || !form.clientName || form.description.length < 10) {
      notify("err", "Title, location, client and a 10+ char description are required.");
      return;
    }
    if (!cover && !form.videoUrl) {
      notify("err", "Add a cover image (or use the sample) before publishing.");
      return;
    }

    setSaving(true);
    try {
      // 1. Upload cover + gallery direct (temp store or S3)
      let coverUrl = cover?.remoteUrl ?? "";
      if (cover) {
        if (!cover.remoteUrl) {
          const [u] = await uploadAll([cover], [coverFileRef.current!], (n) =>
            setCover(n[0]),
          );
          coverUrl = u ?? coverUrl;
        }
      }
      if (!coverUrl) coverUrl = SAMPLE_COVER;

      let galleryUrls: string[] = gallery
        .map((g) => g.remoteUrl)
        .filter(Boolean) as string[];
      if (galleryFilesRef.current.length > 0) {
        galleryUrls = await uploadAll(
          gallery,
          galleryFilesRef.current,
          setGallery,
        );
      }

      let videoUrl = form.videoUrl || video?.remoteUrl || "";
      if (!videoUrl && video && videoFileRef.current) {
        const [u] = await uploadAll([video], [videoFileRef.current], (n) =>
          setVideo(n[0]),
        );
        videoUrl = u ?? "";
      }

      // 2. Persist the project
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          location: form.location,
          sizeSqft: form.sizeSqft || "—",
          year: form.year,
          clientName: form.clientName,
          description: form.description,
          scope: csv(form.scope),
          materials: csv(form.materials),
          tags: csv(form.tags),
          coverUrl,
          galleryUrls,
          videoUrl: videoUrl || null,
          featured: form.featured,
          status: form.status,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      notify("ok", `"${form.title}" added to the portfolio.`);
      setForm(EMPTY);
      setCover(null);
      setGallery([]);
      setVideo(null);
      coverFileRef.current = null;
      galleryFilesRef.current = [];
      videoFileRef.current = null;
      await onCreated();
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Could not save project");
    } finally {
      setSaving(false);
    }
  }

  function pickCover(files: FileList | null) {
    if (!files?.length) return;
    coverFileRef.current = files[0];
    setCover(toUploaded([files[0]], "image")[0]);
  }

  function pickGallery(files: FileList | null) {
    if (!files?.length) return;
    const arr = Array.from(files);
    galleryFilesRef.current = arr;
    setGallery(toUploaded(arr, "image"));
  }

  function pickVideo(files: FileList | null) {
    if (!files?.length) return;
    videoFileRef.current = files[0];
    setVideo(toUploaded([files[0]], "video")[0]);
  }

  const onDrop =
    (handler: (files: FileList | null) => void) =>
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      handler(e.dataTransfer.files);
    };

  return (
    <div className="card-surface p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Project title</label>
          <input
            className="field"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Harbourfront Offices"
          />
        </div>

        <div>
          <label className="label">Sector</label>
          <select
            className="field"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
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
            value={form.clientName}
            onChange={(e) => set("clientName", e.target.value)}
            placeholder="Client name"
          />
        </div>

        <div>
          <label className="label">Location</label>
          <input
            className="field"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="City, area"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Area (sq ft)</label>
            <input
              className="field"
              value={form.sizeSqft}
              onChange={(e) => set("sizeSqft", e.target.value)}
              placeholder="12,000"
            />
          </div>
          <div>
            <label className="label">Year</label>
            <input
              className="field"
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea
            className="field min-h-[120px] resize-y"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What you designed, the constraints, the material story…"
          />
        </div>

        <div>
          <label className="label">Scope (comma separated)</label>
          <input
            className="field"
            value={form.scope}
            onChange={(e) => set("scope", e.target.value)}
            placeholder="Workplace Strategy, Lighting"
          />
        </div>
        <div>
          <label className="label">Materials (comma separated)</label>
          <input
            className="field"
            value={form.materials}
            onChange={(e) => set("materials", e.target.value)}
            placeholder="Oak, Brass, Travertine"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Tags (comma separated)</label>
          <input
            className="field"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="workplace, premium"
          />
        </div>
      </div>

      {/* Cover */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <label className="label">Cover image</label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop(pickCover)}
            onClick={() => coverInput.current?.click()}
            className="relative flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-paper-line bg-paper-soft transition-colors hover:border-brass"
          >
            {cover ? (
              <>
                {cover.kind === "image" && (
                  <Image
                    src={cover.remoteUrl ?? cover.localUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="400px"
                    className="object-cover"
                  />
                )}
                <span className="absolute bottom-3 left-3 rounded-full bg-ink/75 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-brass-light">
                  {cover.remoteUrl ? "Uploaded" : `Drop or click · ${cover.progress}%`}
                </span>
              </>
            ) : (
              <p className="px-6 text-center text-xs text-ink-muted">
                Drag &amp; drop or click to choose a cover image
              </p>
            )}
          </div>
          <input
            ref={coverInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => pickCover(e.target.files)}
          />
          <button
            type="button"
            onClick={() => {
              coverFileRef.current = null;
              setCover({
                name: "sample.jpg",
                kind: "image",
                localUrl: SAMPLE_COVER,
                remoteUrl: SAMPLE_COVER,
                progress: 100,
              });
            }}
            className="mt-3 text-[11px] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-brass"
          >
            Use a sample image instead
          </button>
        </div>

        {/* Gallery + video */}
        <div>
          <label className="label">Gallery (multi-select)</label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop(pickGallery)}
            onClick={() => galleryInput.current?.click()}
            className="flex h-44 cursor-pointer flex-wrap content-start gap-2 overflow-y-auto rounded-xl border border-dashed border-paper-line bg-paper-soft p-3 transition-colors hover:border-brass"
          >
            {gallery.length === 0 ? (
              <p className="m-auto px-4 text-center text-xs text-ink-muted">
                Drop many images here - they upload in parallel on save
              </p>
            ) : (
              gallery.map((g, i) => (
                <figure
                  key={`${g.name}-${i}`}
                  className="relative h-16 w-20 overflow-hidden rounded-md border border-paper-line"
                >
                  <Image
                    src={g.remoteUrl ?? g.localUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-ink/75 text-center text-[9px] text-brass-light">
                    {g.remoteUrl ? "✓" : `${g.progress}%`}
                  </span>
                </figure>
              ))
            )}
          </div>
          <input
            ref={galleryInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => pickGallery(e.target.files)}
          />

          <label className="label mt-5">Video (optional)</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => videoInput.current?.click()}
              className="btn-ghost flex-1 !py-3 text-[11px]"
            >
              {video ? video.name : "Choose video file"}
            </button>
            <input
              ref={videoInput}
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => pickVideo(e.target.files)}
            />
          </div>
          <input
            className="field mt-3"
            placeholder="…or paste a Mux / CDN video URL"
            value={form.videoUrl}
            onChange={(e) => set("videoUrl", e.target.value)}
          />
        </div>
      </div>

      <label className="mt-8 flex items-center gap-3 text-sm text-ink-muted">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="h-4 w-4 accent-brass"
        />
        Feature this project on the homepage hero
      </label>

      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-paper-line pt-8">
        <button onClick={handleSubmit} disabled={saving} className="btn-primary">
          {saving ? "Uploading & saving…" : "Add project"}
        </button>
        <select
          className="field !w-auto"
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
        <button
          onClick={() => {
            setForm(EMPTY);
            setCover(null);
            setGallery([]);
            setVideo(null);
          }}
          className="text-[11px] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-brass"
        >
          Clear form
        </button>
      </div>
    </div>
  );
}
