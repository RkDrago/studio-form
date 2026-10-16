import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteProject, getProjectBySlug, updateProject } from "@/lib/data";

export const dynamic = "force-dynamic";

const PatchSchema = z
  .object({
    title: z.string().min(3),
    category: z.enum(["Commercial", "Residential", "Hospitality", "Retail"]),
    location: z.string().min(1),
    sizeSqft: z.string().min(1),
    year: z.string().min(1),
    clientName: z.string().min(1),
    description: z.string().min(10),
    scope: z.array(z.string()),
    materials: z.array(z.string()),
    coverUrl: z.string().min(1),
    galleryUrls: z.array(z.string()),
    videoUrl: z.string().nullable(),
    tags: z.array(z.string()),
    status: z.enum(["PUBLISHED", "DRAFT"]),
    featured: z.boolean(),
  })
  .partial();

type Ctx = { params: { slug: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const project = getProjectBySlug(params.slug);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const updated = updateProject(params.slug, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const ok = deleteProject(params.slug);
  if (!ok) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, slug: params.slug });
}
