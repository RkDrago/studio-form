import { randomUUID } from "crypto";
import {
  CATEGORIES,
  type Category,
  type MediaItem,
  type MediaType,
  type Project,
  type ProjectInput,
  type Status,
} from "./types";

/**
 * TEMP DATA STORE
 * ---------------------------------------------------------------------------
 * The kit's production path is Prisma + PostgreSQL (see prisma/schema.prisma).
 * Until that is wired up, this module is the whole backend: an in-memory store
 * seeded with demo projects so the frontend and every API route work out of
 * the box. It is pinned to globalThis so Next.js dev HMR does not wipe writes
 * between requests.
 */

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export function slugify(title: string): string {
  return `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-${Date.now().toString(36)}`;
}

type SeedMedia = { url: string; type?: MediaType };

function makeMedia(
  projectId: string,
  urls: SeedMedia[],
  startOrder = 0,
): MediaItem[] {
  return urls.map((m, i) => ({
    id: randomUUID(),
    projectId,
    url: m.url,
    thumbnailUrl: null,
    webpUrl: null,
    type: m.type ?? "IMAGE",
    size: 0,
    order: startOrder + i,
    createdAt: new Date().toISOString(),
  }));
}

function seedProject(
  base: Omit<Project, "id" | "media" | "createdAt"> & {
    gallery: SeedMedia[];
  },
): Project {
  const id = randomUUID();
  const { gallery, ...rest } = base;
  return {
    ...rest,
    id,
    media: makeMedia(id, gallery),
    createdAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
  };
}

function buildSeed(): Project[] {
  return [
    seedProject({
      title: "Meridian Capital Headquarters",
      slug: "meridian-capital-headquarters",
      category: "Commercial",
      location: "BKC, Mumbai",
      sizeSqft: "42,000",
      year: "2024",
      clientName: "Meridian Capital Partners",
      description:
        "A 42,000 sq ft financial headquarters conceived as a quiet, material-led statement. Board-grade acoustic zoning, a fluted-oak reception volume and a 9-metre atrium skylight reframe the working day around natural light. Executive floors trade open plan for cellular suites with bespoke joinery.",
      scope: ["Workplace Strategy", "Interior Architecture", "Furniture Design", "Lighting"],
      materials: ["Fluted Oak", "Patinated Brass", "Nero Marquina", "Wool Broadloom"],
      coverUrl: img("1497366754035-f200968a6e72"),
      videoUrl: null,
      tags: ["workplace", "headquarters", "financial", "premium"],
      status: "PUBLISHED",
      featured: true,
      gallery: [
        { url: img("1497366754035-f200968a6e72") },
        { url: img("1497366811353-6870744d04b2") },
        { url: img("1521737604893-d14cc237f11d") },
        { url: img("1631679706909-1844bbd07221") },
        { url: img("1497366216548-37526070297c") },
      ],
    }),
    seedProject({
      title: "Northlight Creative Campus",
      slug: "northlight-creative-campus",
      category: "Commercial",
      location: "Whitefield, Bengaluru",
      sizeSqft: "88,000",
      year: "2023",
      clientName: "Northlight Labs",
      description:
        "An adaptive reuse of a 1990s industrial shed into a creative campus for 900 people. Exposed structure is retained while inserting a timber-lined library stair, maker studios and a double-height town hall for all-hands gatherings.",
      scope: ["Adaptive Reuse", "Interior Architecture", "Acoustics", "Signage"],
      materials: ["Exposed Concrete", "Birch Ply", "Blackened Steel", "Recycled Rubber"],
      coverUrl: img("1497366216548-37526070297c"),
      videoUrl: null,
      tags: ["campus", "industrial", "creative", "adaptive-reuse"],
      status: "PUBLISHED",
      featured: false,
      gallery: [
        { url: img("1497366216548-37526070297c") },
        { url: img("1497366811353-6870744d04b2") },
        { url: img("1524758631624-e2822e304c36") },
        { url: img("1497366754035-f200968a6e72") },
      ],
    }),
    seedProject({
      title: "The Ashwood Residence",
      slug: "the-ashwood-residence",
      category: "Residential",
      location: "Koregaon Park, Pune",
      sizeSqft: "6,800",
      year: "2024",
      clientName: "Private Client",
      description:
        "A four-bedroom family home organised around a shaded internal court. Deep thresholds, lime-plaster walls and a monochrome material palette create a calm, light-driven interior that stays cool through the Deccan summer.",
      scope: ["Interior Architecture", "Bespoke Joinery", "Landscape Coordination", "Styling"],
      materials: ["Lime Plaster", "Teak", "Travertine", "Belgian Linen"],
      coverUrl: img("1600585154340-be6161a56a0c"),
      videoUrl: null,
      tags: ["villa", "family", "courtyard", "warm-minimal"],
      status: "PUBLISHED",
      featured: true,
      gallery: [
        { url: img("1600585154340-be6161a56a0c") },
        { url: img("1600607687939-ce8a6c25118c") },
        { url: img("1600566753086-00f18fb6b3ea") },
        { url: img("1618221195710-dd6b41faaea6") },
        { url: img("1600210492486-724fe5c67fb0") },
      ],
    }),
    seedProject({
      title: "Vantage Tower Sky Penthouse",
      slug: "vantage-tower-sky-penthouse",
      category: "Residential",
      location: "Golf Course Road, Gurugram",
      sizeSqft: "9,400",
      year: "2025",
      clientName: "Vantage Group",
      description:
        "A duplex penthouse on the 42nd floor, stripped back to a sequence of framed views. Book-matched marble, a suspended brass fireplace and a floating stone stair anchor the double-height living volume.",
      scope: ["Interior Architecture", "Custom Furniture", "AV & Automation", "Art Curation"],
      materials: ["Book-matched Marble", "Smoked Oak", "Bronze Mesh", "Silk Rug"],
      coverUrl: img("1512917774080-9991f1c4c750"),
      videoUrl: SAMPLE_VIDEO,
      tags: ["penthouse", "luxury", "duplex", "skyline"],
      status: "PUBLISHED",
      featured: false,
      gallery: [
        { url: img("1512917774080-9991f1c4c750") },
        { url: img("1560448204-e02f11c3d0e2") },
        { url: img("1616486338812-3dadae4b4ace") },
        { url: img("1600607687939-ce8a6c25118c") },
        { url: SAMPLE_VIDEO, type: "VIDEO" },
      ],
    }),
    seedProject({
      title: "Casa Aurelia Resort",
      slug: "casa-aurelia-resort",
      category: "Hospitality",
      location: "Assagao, Goa",
      sizeSqft: "24,000",
      year: "2023",
      clientName: "Aurelia Hotels",
      description:
        "A 22-key boutique resort woven through a coconut grove. Guest pavilions open onto private plunge courts, while the lobby, restaurant and spa read as a single continuous verandah of terrazzo and cane.",
      scope: ["Interior Architecture", "FF&E", "F&B Design", "Spa & Wellness"],
      materials: ["Terrazzo", "Cane", "Kota Stone", "Indigo Limewash"],
      coverUrl: img("1571003123894-1f0594d2b5d9"),
      videoUrl: SAMPLE_VIDEO,
      tags: ["resort", "boutique-hotel", "tropical", "wellness"],
      status: "PUBLISHED",
      featured: true,
      gallery: [
        { url: img("1571003123894-1f0594d2b5d9") },
        { url: img("1566073771259-6a8506099945") },
        { url: img("1517248135467-4c7edcad34c4") },
        { url: img("1552566626-52f8b828add9") },
      ],
    }),
    seedProject({
      title: "The Warehouse Kitchen & Bar",
      slug: "the-warehouse-kitchen-and-bar",
      category: "Hospitality",
      location: "Jubilee Hills, Hyderabad",
      sizeSqft: "11,200",
      year: "2024",
      clientName: "Verbena F&B",
      description:
        "A 260-cover restaurant and cocktail bar inside a converted godown. A 12-metre copper bar, undulating brick vaults and a retractable courtyard roof give the room three distinct moods across the evening.",
      scope: ["F&B Design", "Interior Architecture", "Bar Fabrication", "Lighting"],
      materials: ["Copper", "Reclaimed Brick", "Poured Concrete", "Ember Oak"],
      coverUrl: img("1517248135467-4c7edcad34c4"),
      videoUrl: null,
      tags: ["restaurant", "bar", "industrial", "nightlife"],
      status: "PUBLISHED",
      featured: false,
      gallery: [
        { url: img("1517248135467-4c7edcad34c4") },
        { url: img("1552566626-52f8b828add9") },
        { url: img("1524758631624-e2822e304c36") },
      ],
    }),
    seedProject({
      title: "Atelier Luxe Flagship",
      slug: "atelier-luxe-flagship",
      category: "Retail",
      location: "The Chanakya, New Delhi",
      sizeSqft: "7,600",
      year: "2024",
      clientName: "Atelier Luxe",
      description:
        "A flagship boutique staged as a gallery of alcoves. A monolithic stone portal marks arrival, and a curated sequence of plinths, vitrines and tapestries slows the customer down to a couture pace.",
      scope: ["Retail Design", "VM Strategy", "Millwork", "Lighting"],
      materials: ["Rosa Perlino", "Antiqued Mirror", "Velvet", "Brushed Gold"],
      coverUrl: img("1567016432779-094069958ea5"),
      videoUrl: null,
      tags: ["retail", "flagship", "couture", "luxury"],
      status: "PUBLISHED",
      featured: true,
      gallery: [
        { url: img("1567016432779-094069958ea5") },
        { url: img("1441986300917-64674bd600d8") },
        { url: img("1567401893414-76b7b1e5a7a5") },
        { url: img("1555529669-e69e7aa0ba9a") },
      ],
    }),
    seedProject({
      title: "Kala Collective Store",
      slug: "kala-collective-store",
      category: "Retail",
      location: "C-Scheme, Jaipur",
      sizeSqft: "4,300",
      year: "2023",
      clientName: "Kala Collective",
      description:
        "A craft-led concept store celebrating Rajasthani makers. Display is built from local stone and hand-turned timber so the fixtures read as furniture rather than retail fittings.",
      scope: ["Retail Design", "Fixture Design", "Graphics Coordination"],
      materials: ["Jaisalmer Stone", "Hand-turned Teak", "Handloom", "Brass"],
      coverUrl: img("1555529669-e69e7aa0ba9a"),
      videoUrl: null,
      tags: ["retail", "craft", "concept-store", "heritage"],
      status: "PUBLISHED",
      featured: false,
      gallery: [
        { url: img("1555529669-e69e7aa0ba9a") },
        { url: img("1441986300917-64674bd600d8") },
        { url: img("1503387762-592deb58ef4e") },
      ],
    }),
  ];
}

interface Store {
  projects: Project[];
}

const globalStore = globalThis as unknown as { __studioformStore?: Store };

function store(): Store {
  if (!globalStore.__studioformStore) {
    globalStore.__studioformStore = { projects: buildSeed() };
  }
  return globalStore.__studioformStore;
}

/* ------------------------------- queries -------------------------------- */

export interface ListFilters {
  category?: string | null;
  q?: string | null;
  status?: Status | null;
  featured?: boolean | null;
}

export function listProjects(filters: ListFilters = {}): Project[] {
  const { category, q, status, featured } = filters;
  let rows = [...store().projects];

  if (category && category !== "All") {
    rows = rows.filter((p) => p.category === (category as Category));
  }
  if (status) rows = rows.filter((p) => p.status === status);
  if (typeof featured === "boolean") rows = rows.filter((p) => p.featured === featured);
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((p) =>
      [p.title, p.location, p.clientName, p.description, ...p.tags, ...p.scope]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  return rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getProjectBySlug(slug: string): Project | undefined {
  return store().projects.find((p) => p.slug === slug);
}

export function getProjectById(id: string): Project | undefined {
  return store().projects.find((p) => p.id === id);
}

export function getStats() {
  const projects = store().projects;
  const media = projects.flatMap((p) => p.media);
  return {
    projects: projects.length,
    published: projects.filter((p) => p.status === "PUBLISHED").length,
    draft: projects.filter((p) => p.status === "DRAFT").length,
    media: media.length,
    images: media.filter((m) => m.type === "IMAGE").length,
    videos: media.filter((m) => m.type === "VIDEO").length,
    featured: projects.filter((p) => p.featured).length,
    byCategory: CATEGORIES.reduce<Record<string, number>>((acc, c) => {
      acc[c] = projects.filter((p) => p.category === c).length;
      return acc;
    }, {}),
  };
}

/* ------------------------------ mutations -------------------------------- */

export function createProject(input: ProjectInput): Project {
  const id = randomUUID();
  const project: Project = {
    id,
    title: input.title,
    slug: slugify(input.title),
    category: input.category,
    location: input.location,
    sizeSqft: input.sizeSqft,
    year: input.year,
    clientName: input.clientName,
    description: input.description,
    scope: input.scope ?? [],
    materials: input.materials ?? [],
    coverUrl: input.coverUrl,
    videoUrl: input.videoUrl || null,
    tags: input.tags ?? [],
    status: input.status ?? "PUBLISHED",
    featured: input.featured ?? false,
    media: makeMedia(
      id,
      (input.galleryUrls ?? []).map((url) => ({ url })),
    ),
    createdAt: new Date().toISOString(),
  };

  if (project.videoUrl) {
    project.media.push({
      id: randomUUID(),
      projectId: id,
      url: project.videoUrl,
      thumbnailUrl: null,
      webpUrl: null,
      type: "VIDEO",
      size: 0,
      order: project.media.length,
      createdAt: new Date().toISOString(),
    });
  }

  store().projects.unshift(project);
  return project;
}

export function updateProject(
  slug: string,
  patch: Partial<ProjectInput>,
): Project | undefined {
  const project = getProjectBySlug(slug);
  if (!project) return undefined;

  Object.assign(project, {
    ...("title" in patch && patch.title ? { title: patch.title } : {}),
    ...("category" in patch && patch.category ? { category: patch.category } : {}),
    ...("location" in patch ? { location: patch.location } : {}),
    ...("sizeSqft" in patch ? { sizeSqft: patch.sizeSqft } : {}),
    ...("year" in patch ? { year: patch.year } : {}),
    ...("clientName" in patch ? { clientName: patch.clientName } : {}),
    ...("description" in patch ? { description: patch.description } : {}),
    ...("scope" in patch && patch.scope ? { scope: patch.scope } : {}),
    ...("materials" in patch && patch.materials ? { materials: patch.materials } : {}),
    ...("coverUrl" in patch && patch.coverUrl ? { coverUrl: patch.coverUrl } : {}),
    ...("videoUrl" in patch ? { videoUrl: patch.videoUrl || null } : {}),
    ...("tags" in patch && patch.tags ? { tags: patch.tags } : {}),
    ...("status" in patch && patch.status ? { status: patch.status } : {}),
    ...("featured" in patch && typeof patch.featured === "boolean"
      ? { featured: patch.featured }
      : {}),
  });

  return project;
}

export function deleteProject(slug: string): boolean {
  const s = store();
  const idx = s.projects.findIndex((p) => p.slug === slug);
  if (idx === -1) return false;
  s.projects.splice(idx, 1);
  return true;
}

export function addMedia(
  projectId: string,
  items: { url: string; type?: MediaType; size?: number; thumbnailUrl?: string | null }[],
): MediaItem[] {
  const project = getProjectById(projectId);
  if (!project) return [];

  const created = items.map((m, i) => ({
    id: randomUUID(),
    projectId,
    url: m.url,
    thumbnailUrl: m.thumbnailUrl ?? null,
    webpUrl: null,
    type: m.type ?? "IMAGE",
    size: m.size ?? 0,
    order: project.media.length + i,
    createdAt: new Date().toISOString(),
  }));

  project.media.push(...created);
  return created;
}

export function resetStore(): void {
  globalStore.__studioformStore = { projects: buildSeed() };
}
