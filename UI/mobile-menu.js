(() => {
  const MOBILE_NAV_CLASS = "mobile-nav-open";
  const CLOSE_BUTTON_CLASS = "mobile-nav-close";

  const pageTargets = new Map([
    ["build new brief", "Briefs"],
    ["create agent brief", "Briefs"],
    ["view live agents", "Agents"],
    ["open calendar", "Calendar"],
    ["run agents", "Briefs"],
    ["open brief", "Briefs"],
    ["view all launches", "Campaigns"],
  ]);

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function ensureCloseButton() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar || sidebar.querySelector(`.${CLOSE_BUTTON_CLASS}`)) {
      return;
    }

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = CLOSE_BUTTON_CLASS;
    closeButton.setAttribute("aria-label", "Close navigation");
    closeButton.innerHTML = `<span>Close menu</span><strong aria-hidden="true">×</strong>`;
    sidebar.insertBefore(closeButton, sidebar.firstChild);
  }

  function setMobileNav(open) {
    ensureCloseButton();
    document.body.classList.toggle(MOBILE_NAV_CLASS, open);
    const menuButton = document.querySelector(".mobile-menu");
    if (menuButton) {
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    }
  }

  function toggleMobileNav() {
    setMobileNav(!document.body.classList.contains(MOBILE_NAV_CLASS));
  }

  function closeMobileNav() {
    setMobileNav(false);
  }

  function navigateWithSidebar(label) {
    const target = normalizeText(label);
    const matchingLink = Array.from(document.querySelectorAll(".side-link")).find(
      (link) => normalizeText(link.textContent) === target,
    );

    if (matchingLink) {
      matchingLink.click();
      closeMobileNav();
      return true;
    }

    window.location.hash = target.replace(/\s+/g, "-");
    closeMobileNav();
    return false;
  }

  document.addEventListener("click", (event) => {
    const closeButton = event.target.closest(`.${CLOSE_BUTTON_CLASS}`);
    if (closeButton) {
      event.preventDefault();
      closeMobileNav();
      return;
    }

    const menuButton = event.target.closest(".mobile-menu");
    if (menuButton) {
      event.preventDefault();
      toggleMobileNav();
      return;
    }

    if (document.body.classList.contains(MOBILE_NAV_CLASS) && !event.target.closest(".sidebar") && !event.target.closest(".mobile-menu")) {
      closeMobileNav();
    }

    if (event.target.closest(".side-link")) {
      closeMobileNav();
      return;
    }

    const clickable = event.target.closest("button, a");
    if (!clickable || clickable.disabled || clickable.matches(".side-link") || clickable.matches(`.${CLOSE_BUTTON_CLASS}`)) {
      return;
    }

    const targetPage = pageTargets.get(normalizeText(clickable.textContent));
    if (targetPage) {
      event.preventDefault();
      navigateWithSidebar(targetPage);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileNav();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1180) {
      closeMobileNav();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector(".mobile-menu");
    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-controls", "mobile-navigation");
    }

    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      sidebar.id = "mobile-navigation";
    }

    ensureCloseButton();
  });
})();
