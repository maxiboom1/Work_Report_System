export function $id(id) {
  return document.getElementById(id);
}

export function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

export function setPlaceholder(id, text) {
  const el = $id(id);
  if (el) el.placeholder = text;
}
