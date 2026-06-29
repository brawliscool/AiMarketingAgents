const pageActions = new Map([
  ["build new brief", "Briefs"],
  ["create agent brief", "Briefs"],
  ["run agents", "Briefs"],
  ["open brief", "Briefs"],
  ["view live agents", "Agents"],
  ["open calendar", "Calendar"],
  ["view all launches", "Campaigns"],
]);

function normalizeLabel(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function navigateToPage(pageName) {
  const pageLabel = normalizeLabel(pageName);
  const navLink = [...document.querySelectorAll(".side-nav a, a.side-link")]
    .find((link) => normalizeLabel(link.textContent) === pageLabel);

  if (navLink) {
    navLink.click();
    return;
  }

  window.location.hash = pageLabel.replace(/\s+/g, "-");
}

document.addEventListener("click", (event) => {
  const clickable = event.target.closest("button, a");
  if (!clickable || clickable.disabled || clickable.matches(".side-link")) return;

  const targetPage = pageActions.get(normalizeLabel(clickable.textContent));
  if (!targetPage) return;

  event.preventDefault();
  navigateToPage(targetPage);
});
