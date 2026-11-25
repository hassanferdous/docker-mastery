// Read at request time so the same build works with any API_URL.
export function apiUrl(path) {
  const base = process.env.API_URL || "http://localhost:8000";
  return `${base}${path}`;
}
