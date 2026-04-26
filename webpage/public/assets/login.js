const form = document.getElementById("login-form");
const btn = document.getElementById("btn-login");
const statusEl = document.getElementById("status");
const loadingOverlay = document.getElementById("login-loading-overlay");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("btn-toggle-password");
const params = new URLSearchParams(window.location.search);
const MIN_LOADING_MS = 1200;
let loadingStartedAt = 0;

function setStatus(msg) {
  statusEl.textContent = msg;
}

function setLoading(isLoading) {
  if (isLoading) loadingStartedAt = Date.now();
  btn.disabled = isLoading;
  btn.classList.toggle("is-loading", isLoading);
  btn.setAttribute("aria-busy", isLoading ? "true" : "false");
  document.body.classList.toggle("is-login-loading", isLoading);
  if (loadingOverlay) loadingOverlay.hidden = !isLoading;
}

function waitForMinimumLoading() {
  const elapsed = Date.now() - loadingStartedAt;
  const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
  return new Promise((resolve) => window.setTimeout(resolve, remaining));
}

if (params.get("session") === "expired") {
  setStatus("Session expired. Please log in again.");
  window.history.replaceState({}, document.title, "/login.html");
}

for (const input of [usernameInput, passwordInput]) {
  input.addEventListener("pointerup", () => {
    if (document.activeElement !== input) input.focus();
  });
}

togglePasswordBtn.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePasswordBtn.classList.toggle("is-visible", isHidden);
  togglePasswordBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  togglePasswordBtn.setAttribute("title", isHidden ? "Hide password" : "Show password");
  passwordInput.focus();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    setStatus("Please enter username and password.");
    return;
  }

  setLoading(true);
  setStatus("");

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // cookie-based JWT later
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      await waitForMinimumLoading();
      setStatus(data?.message || "Login failed.");
      setLoading(false);
      return;
    }
    await waitForMinimumLoading();
    window.location.href = "/"; // server will serve admin/user after auth (next step)
  } catch (err) {
    await waitForMinimumLoading();
    setStatus("Network error.");
    setLoading(false);
  }
});
