export async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });

  let body = null;
  try { body = await res.json(); } catch {}

  if (!res.ok) {
    if (res.status === 401 && !options.skipAuthRedirect) {
      const loginUrl = new URL("/login.html", window.location.origin);
      loginUrl.searchParams.set("session", "expired");
      window.location.replace(loginUrl.toString());
      await new Promise(() => {});
    }
    const message = body?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.code = body?.code || null;
    error.body = body;
    throw error;
  }
  return body;
}
