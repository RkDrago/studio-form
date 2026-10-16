"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MediaItem } from "@/lib/types";

export default function ProjectGallery({
  title,
  media,
}: {
  title: string;
  media: MediaItem[];
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (media.length === 0) return null;
  const active = media[index];

  return (
    <div>
      <button
        type="button"
        onClick={() => active.type === "IMAGE" && setLightbox(true)}
        className="relative block aspect-[16/9] w-full overflow-hidden rounded-2xl border border-ink-line bg-ink grain"
      >
        {active.type === "VIDEO" ? (
          <video
            key={active.id}
            src={active.url}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            key={active.id}
            src={active.url}
            alt={`${title} - asset ${index + 1}`}
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover"
            priority={index === 0}
          />
        )}
      </button>

      {media.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {media.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setIndex(i)}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg border transition-colors ${
                i === index ? "border-brass" : "border-ink-line hover:border-sand-muted"
              }`}
              aria-label={`Show asset ${i + 1}`}
            >
              {m.type === "VIDEO" ? (
                <span className="flex h-full w-full items-center justify-center bg-ink text-[10px] uppercase tracking-[0.14em] text-sand-muted">
                  Video
                </span>
              ) : (
                <Image src={m.url} alt="" fill sizes="120px" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && active.type === "IMAGE" && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <div className="relative h-full max-h-[85vh] w-full max-w-6xl">
              <Image
                src={active.url}
                alt={title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <button
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-ink-line text-sand-muted hover:border-brass hover:text-brass"
              aria-label="Close lightbox"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
