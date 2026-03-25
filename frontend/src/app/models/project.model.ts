export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  technologies: string[];
  imageUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
}
