export type ProjectStatus = "active" | "prototype" | "complete" | "archived";

export type ProjectLink = {
  label: string;
  url: string;
};

export type ConversationStarter = {
  title: string;
  body: string;
  audiences: readonly string[];
  ctaLabel: string;
};

export type ProjectDetail = {
  overview: string;
  conversationStarter?: ConversationStarter;
  body: string;
};

export type ProjectDefinition = {
  slug: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  categories: readonly string[];
  thumbnail?: string;
  links: readonly ProjectLink[];
  detail?: ProjectDetail;
};

/**
 * Defines a project while preserving literal values and providing contextual
 * autocomplete and validation for project content.
 */
export function defineProject<const T extends ProjectDefinition>(project: T): T {
  return project;
}

/** Removes code indentation from a Markdown template literal. */
export function markdown(strings: TemplateStringsArray, ...values: unknown[]): string {
  const value = strings.reduce(
    (result, part, index) => result + part + (index < values.length ? String(values[index]) : ""),
    "",
  );
  const lines = value.replace(/^\n/, "").replace(/\s+$/, "").split("\n");
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^\s*/)?.[0].length ?? 0);
  const indentation = indents.length > 0 ? Math.min(...indents) : 0;

  return lines.map((line) => line.slice(indentation)).join("\n");
}
