export type ProjectLink = { label: string; url: string };

export type Project = {
  slug: string;
  title: string;
  description: string;
  status: string;
  categories: string[];
  thumbnail?: string;
  links: ProjectLink[];
  hasDetailPage: boolean;
};