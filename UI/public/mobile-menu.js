let mobileMenuReady = false;

function setupMobileMenu() {
  if (mobileMenuReady) {
    return true;
  }

  const menuButton = document.querySelector(".mobile-menu");
  const sidebar = document.querySelector(".sidebar");

  if (!menuButton || !sidebar) {
    return false;
  }

  mobileMenuReady = true;

  let backdrop = document.querySelector(".mobile-backdrop");

  if (!backdrop) {
    backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "mobile-backdrop";
    backdrop.setAttribute("aria-label", "Close navigation");
    document.body.appendChild(backdrop);
  }

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

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      closeMenu();
    }
  });

  return true;
}

function watchForMobileMenu() {
  if (setupMobileMenu()) {
    return;
  }

  const observer = new MutationObserver(() => {
    if (setupMobileMenu()) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", watchForMobileMenu);
} else {
  watchForMobileMenu();
}
