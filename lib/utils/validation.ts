export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SLUG_RE = /^[a-z0-9][a-z0-9_-]{0,127}$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}
