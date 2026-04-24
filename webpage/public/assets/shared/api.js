export async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let body = null;
  try { body = await res.json(); } catch {}

  if (!res.ok) {
    const message = body?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}
