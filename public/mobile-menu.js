function setupMobileMenu() {
  const menuButton = document.querySelector(".mobile-menu");
  const sidebar = document.querySelector(".sidebar");

  if (!menuButton || !sidebar || document.querySelector(".mobile-backdrop")) {
    return;
  }

  const backdrop = document.createElement("button");
  backdrop.type = "button";
  backdrop.className = "mobile-backdrop";
  backdrop.setAttribute("aria-label", "Close navigation");
  document.body.appendChild(backdrop);

  const closeMenu = () => {
    document.body.classList.remove("mobile-nav-open");
    menuButton.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    document.body.classList.add("mobile-nav-open");
    menuButton.setAttribute("aria-expanded", "true");
  };

  menuButton.setAttribute("aria-controls", "mobile-navigation");
  menuButton.setAttribute("aria-expanded", "false");
  sidebar.id = "mobile-navigation";

  menuButton.addEventListener("click", () => {
    if (document.body.classList.contains("mobile-nav-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  backdrop.addEventListener("click", closeMenu);

  sidebar.addEventListener("click", (event) => {
    if (event.target.closest(".side-link")) {
      closeMenu();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupMobileMenu);
} else {
  setupMobileMenu();
}
