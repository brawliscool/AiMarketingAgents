document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const label = button.textContent.replace(/\s+/g, " ").trim().toLowerCase();
  if (label !== "build new brief") return;

  event.preventDefault();

  const briefsLink = [...document.querySelectorAll(".side-nav a, a.side-link")]
    .find((link) => link.textContent.replace(/\s+/g, " ").trim().toLowerCase() === "briefs");

  if (briefsLink) {
    briefsLink.click();
    return;
  }

  window.location.hash = "briefs";
});
