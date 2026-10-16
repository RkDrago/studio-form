/**
 * Core bulk upload engine - handles 200+ files with concurrency control.
 * Works against real S3 or the temp local store depending on what
 * /api/media/presign returns.
 */

export type UploadStatus = "queued" | "uploading" | "done" | "error";

export type UploadItem = {
  file: File;
  progress: number;
  status: UploadStatus;
  url?: string;
  error?: string;
};

export const CONCURRENCY = 6; // S3 likes 5-8 parallel

export interface PresignResponse {
  url: string;
  fields: Record<string, string>;
  cdnUrl: string;
  key: string;
  mode: "s3" | "temp";
}

export async function getPresignedUrl(
  fileName: string,
  fileType: string,
): Promise<PresignResponse> {
  const res = await fetch("/api/media/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, fileType }),
  });
  if (!res.ok) throw new Error(`presign failed: ${res.status}`);
  return res.json();
}

export async function uploadWithProgress(
  file: File,
  onProgress: (p: number) => void,
): Promise<{ url: string; key: string }> {
  const { url, fields, cdnUrl, key } = await getPresignedUrl(
    file.name,
    file.type,
  );

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204) {
        // S3 responds 204 with no body and we use the CDN url from presign.
        // The temp store responds with JSON carrying the real served url.
        let served: string | undefined;
        try {
          served = JSON.parse(xhr.responseText || "{}")?.url;
        } catch {
          served = undefined;
        }
        resolve({ url: served || cdnUrl, key });
      } else {
        reject(new Error(xhr.responseText || `Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    fd.append("file", file);
    xhr.open("POST", url);
    xhr.send(fd);
  });
}

export async function bulkUpload(
  files: File[],
  onItemUpdate: (index: number, item: Partial<UploadItem>) => void,
): Promise<{ url: string; key: string }[]> {
  const queue = files.map((_, i) => i);
  const results: { url: string; key: string }[] = new Array(files.length);
  let active = 0;

  return new Promise((resolve) => {
    const next = () => {
      if (queue.length === 0 && active === 0) return resolve(results);
      while (active < CONCURRENCY && queue.length) {
        const idx = queue.shift()!;
        active++;
        onItemUpdate(idx, { status: "uploading", progress: 0 });
        uploadWithProgress(files[idx], (p) =>
          onItemUpdate(idx, { progress: p }),
        )
          .then((res) => {
            results[idx] = res;
            onItemUpdate(idx, { status: "done", url: res.url, progress: 100 });
          })
          .catch((e: unknown) =>
            onItemUpdate(idx, {
              status: "error",
              error: e instanceof Error ? e.message : String(e),
            }),
          )
          .finally(() => {
            active--;
            next();
          });
      }
    };
    next();
  });
}

/** Turn a File into a local object URL for instant previews (frontend-only). */
export function previewUrl(file: File): string {
  return URL.createObjectURL(file);
}
