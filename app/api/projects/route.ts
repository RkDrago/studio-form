import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createProject, getStats, listProjects } from "@/lib/data";

export const dynamic = "force-dynamic";

const ProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.enum(["Commercial", "Residential", "Hospitality", "Retail"]),
  location: z.string().min(1),
  sizeSqft: z.string().min(1),
  year: z.string().min(1),
  clientName: z.string().min(1),
  description: z.string().min(10, "Description is too short"),
  scope: z.array(z.string()).default([]),
  materials: z.array(z.string()).default([]),
  coverUrl: z.string().min(1, "Cover image is required"),
  galleryUrls: z.array(z.string()).default([]),
  videoUrl: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["PUBLISHED", "DRAFT"]).default("PUBLISHED"),
  featured: z.boolean().default(false),
});

/** GET /api/projects?category=Commercial&q=tower&featured=true */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const featuredParam = searchParams.get("featured");

  const projects = listProjects({
    category: searchParams.get("category"),
    q: searchParams.get("q"),
    status: (searchParams.get("status") as "PUBLISHED" | "DRAFT" | null) ?? null,
    featured: featuredParam === null ? null : featuredParam === "true",
  });

  return NextResponse.json({
    projects,
    count: projects.length,
    stats: getStats(),
    source: "temp-data",
  });
}

/** POST /api/projects - create a project (admin) */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const project = createProject(parsed.data);
  return NextResponse.json(project, { status: 201 });
}
