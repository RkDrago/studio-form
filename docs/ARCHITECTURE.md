# STUDIOFORM — Architecture

Interior architecture portfolio (public) + content studio (admin) in one Next.js 14
App Router app. The public site and every admin action run against a single
**temp data store** so the whole thing works with zero infrastructure.

## Stack

| Layer     | Kit target                    | What runs today                          |
| --------- | ----------------------------- | ---------------------------------------- |
| Frontend  | Next.js 14 App Router + TS    | ✅ same                                  |
| Styling   | Tailwind + Framer Motion      | ✅ same                                  |
| Data      | Prisma + PostgreSQL           | 🟡 `lib/data.ts` temp store (schema in `prisma/schema.prisma`) |
| Storage   | AWS S3 + CloudFront           | 🟡 presign route falls back to `lib/blobStore.ts` until AWS creds exist |
| Video     | Mux                           | 🟡 URL field only (paste a Mux/CDN URL)  |
| Auth      | NextAuth                      | ⬜ not wired (see Next steps)            |
| Deploy    | Vercel / Docker               | ✅ any Node host                         |

## Data flow

```
app/page.tsx ─────────────► lib/data.ts (listProjects / getStats)
app/project/[slug] ───────► lib/data.ts (getProjectBySlug)
components/PortfolioGrid ─► GET  /api/projects
components/AdminStudio ───► POST /api/projects, PATCH/DELETE /api/projects/[slug]
components/admin/BulkMediaTab
                          ├► POST /api/media/presign  ──► S3 presigned POST
                          │                              └─ or /api/upload (temp)
                          ├► POST /api/media/bulk     ──► lib/data.addMedia
                          └► POST /api/media/optimize ──► (stub: queues Sharp jobs)
```

`lib/data.ts` is pinned to `globalThis`, so server-side writes survive dev HMR but
reset on restart — that is intentional for demo data.

## The bulk upload engine

`lib/bulkUpload.ts` is the heart of the kit and is storage-agnostic.

1. The browser asks `/api/media/presign` for one target per file.
   - AWS creds present → a real presigned S3 POST (500 MB cap, 10 min expiry).
   - No creds → a local `/api/upload` target backed by `lib/blobStore.ts`.
2. `bulkUpload()` runs a promise pool at `CONCURRENCY = 6` and reports
   `{ progress, status }` per item — the grid shows live bars.
3. Bytes never pass through a server function in S3 mode, so 200+ files is a
   browser/network question, not a memory question.

The client prefers the URL returned in the upload response, which is what makes
the temp store work while keeping the S3 path untouched (S3 replies `204` with no
body, so the CDN URL from presign is used).

## API reference

| Method | Route                  | Body / query                                             |
| ------ | ---------------------- | -------------------------------------------------------- |
| GET    | `/api/projects`        | `?category=Commercial&q=tower&status=PUBLISHED&featured=true` |
| POST   | `/api/projects`        | `{ title, category, location, sizeSqft, year, clientName, description, scope[], materials[], coverUrl, galleryUrls[], videoUrl?, tags[], status?, featured? }` |
| GET    | `/api/projects/[slug]` | —                                                        |
| PATCH  | `/api/projects/[slug]` | any subset of the POST body                              |
| DELETE | `/api/projects/[slug]` | —                                                        |
| POST   | `/api/media/presign`   | `{ fileName, fileType }` → `{ url, fields, cdnUrl, key, mode }` |
| POST   | `/api/media/bulk`      | `{ projectId, urls: [{ url, type?, size? }] }`           |
| POST   | `/api/media/optimize`  | `{ projectId }` → `202` accepted                         |
| POST   | `/api/upload`          | multipart `key`, `contentType`, `file` (temp mode only)  |
| GET    | `/api/files/[id]`      | the bytes for a temp-mode upload                         |

All writes are validated with Zod and return `422` with a field breakdown.

## Production checklist

- [ ] `npx prisma db push` and swap `lib/data.ts` internals for PrismaClient
- [ ] Set AWS env vars — presign switches to S3 automatically (`uploadMode`)
- [ ] Lock bucket CORS to the production domain
- [ ] Replace the optimize stub with Sharp: strip EXIF, emit WebP + thumbnail
- [ ] Protect `/admin` and the write APIs with NextAuth middleware
- [ ] `revalidate = 60` is already set on `/`; CDN images cache for a year
