import type { Metadata } from "next";
import AdminStudio from "@/components/AdminStudio";
import { getStats, listProjects } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Content Studio",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  // Reads the same temp store the API routes mutate.
  const projects = listProjects({});
  const stats = getStats();

  return <AdminStudio initialProjects={projects} initialStats={stats} />;
}
