/**
 * TEMP BLOB STORE (stands in for S3)
 * ---------------------------------------------------------------------------
 * Real deployments upload straight to S3 with a presigned POST. Without AWS
 * credentials the kit falls back to this process-memory store: the presign
 * route hands the browser a local upload URL, bytes land here, and
 * /api/files/<id> serves them back with the right content type.
 *
 * Nothing survives a server restart - that is the point of "temp data".
 */

interface Blob {
  id: string;
  key: string;
  contentType: string;
  size: number;
  bytes: Uint8Array;
  createdAt: string;
}

interface BlobStore {
  blobs: Map<string, Blob>;
}

const g = globalThis as unknown as { __studioformBlobs?: BlobStore };

function store(): BlobStore {
  if (!g.__studioformBlobs) g.__studioformBlobs = { blobs: new Map() };
  return g.__studioformBlobs;
}

export function putBlob(input: {
  key: string;
  contentType: string;
  bytes: Uint8Array;
}): Blob {
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const blob: Blob = {
    id,
    key: input.key,
    contentType: input.contentType || "application/octet-stream",
    size: input.bytes.byteLength,
    bytes: input.bytes,
    createdAt: new Date().toISOString(),
  };
  store().blobs.set(id, blob);
  return blob;
}

export function getBlob(id: string): Blob | undefined {
  return store().blobs.get(id);
}

export function blobCount(): number {
  return store().blobs.size;
}
