export type Category = "Commercial" | "Residential" | "Hospitality" | "Retail";
export type Status = "PUBLISHED" | "DRAFT";
export type MediaType = "IMAGE" | "VIDEO";

export const CATEGORIES: Category[] = [
  "Commercial",
  "Residential",
  "Hospitality",
  "Retail",
];

export interface MediaItem {
  id: string;
  projectId: string | null;
  url: string;
  thumbnailUrl: string | null;
  webpUrl: string | null;
  type: MediaType;
  size: number;
  order: number;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: Category;
  location: string;
  sizeSqft: string;
  year: string;
  clientName: string;
  description: string;
  scope: string[];
  materials: string[];
  coverUrl: string;
  videoUrl: string | null;
  tags: string[];
  status: Status;
  featured: boolean;
  media: MediaItem[];
  createdAt: string;
}

export interface ProjectInput {
  title: string;
  category: Category;
  location: string;
  sizeSqft: string;
  year: string;
  clientName: string;
  description: string;
  scope: string[];
  materials: string[];
  coverUrl: string;
  galleryUrls: string[];
  videoUrl?: string | null;
  tags?: string[];
  status?: Status;
  featured?: boolean;
}
