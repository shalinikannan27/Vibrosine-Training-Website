document.addEventListener("DOMContentLoaded", () => {
  if (window.Vibrosine) Vibrosine.boot();
});

document.addEventListener("error", (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  console.error("Site image could not be loaded:", image.currentSrc || image.src);
  const figure = image.closest("figure");
  if (figure) {
    figure.remove();
    return;
  }
  image.closest(".ph-media")?.remove();
}, true);

document.addEventListener("keydown", (event) => {
  const lightbox = document.querySelector("#gallery-lightbox");
  if (event.key === "Escape" && lightbox instanceof HTMLDialogElement && lightbox.open) {
    event.preventDefault();
    lightbox.close();
  }
});

document.addEventListener("vibrosine:ready", () => {
  const menuButton = document.getElementById("menu-btn");
  const menu = document.getElementById("nav-list");
  const backdrop = document.querySelector(".nav-backdrop");
  const navbar = menuButton?.closest(".navbar");

  const closeMenu = () => {
    if (!menuButton || !menu || !backdrop) return;
    menu.classList.remove("open");
    navbar?.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    backdrop.hidden = true;
  };
  const openMenu = () => {
    if (!menuButton || !menu || !backdrop) return;
    menu.classList.add("open");
    navbar?.classList.add("menu-open");
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close menu");
    backdrop.hidden = false;
    menu.querySelector("summary, a")?.focus();
  };

  if (menuButton && menu && backdrop) {
    menuButton.addEventListener("click", () => {
      menuButton.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu();
    });
    menu.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) closeMenu();
    });
    backdrop.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuButton.focus();
      }
      if (event.key === "Tab" && menuButton.getAttribute("aria-expanded") === "true") {
        const focusable = [...menu.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), summary, select:not([disabled])")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    });
  }

  const courseSelect = document.querySelector("select[name='course']");
  if (courseSelect) {
    const requestedCourse = new URLSearchParams(location.search).get("course");
    if (requestedCourse) {
      const match = [...courseSelect.options].find((option) => option.value === requestedCourse || option.textContent === requestedCourse);
      if (match) courseSelect.value = match.value;
    }
  }

  const enquiryForm = document.querySelector("[data-whatsapp-enquiry]");
  if (enquiryForm instanceof HTMLFormElement) {
    enquiryForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!enquiryForm.reportValidity()) return;

      const values = new FormData(enquiryForm);
      const name = String(values.get("name") || "").trim();
      const phone = String(values.get("phone") || "").trim();
      const email = String(values.get("email") || "").trim();
      const course = String(values.get("course") || "").trim();
      const message = String(values.get("message") || "").trim();
      const lines = [
        "Hello Vibrosine, I would like to make an enquiry.",
        `Name: ${name}`,
        `Phone: ${phone}`,
        email ? `Email: ${email}` : "",
        course ? `Course or service: ${course}` : "",
        message ? `Message: ${message}` : ""
      ].filter(Boolean);
      const destination = new URL(enquiryForm.action);
      destination.searchParams.set("text", lines.join("\n"));
      const whatsappWindow = window.open(destination.toString(), "_blank");
      if (whatsappWindow) whatsappWindow.opener = null;
      else window.location.assign(destination.toString());
    });
  }

  const lightbox = document.querySelector("#gallery-lightbox");
  if (lightbox instanceof HTMLDialogElement) {
    const lightboxImage = lightbox.querySelector("img");
    const lightboxCaption = lightbox.querySelector("p");
    const closeButton = lightbox.querySelector(".lightbox-close");
    document.querySelectorAll("[data-lightbox-src]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        if (!(lightboxImage instanceof HTMLImageElement) || !(lightboxCaption instanceof HTMLElement)) return;
        lightboxImage.src = trigger.dataset.lightboxSrc || "";
        const srcset = trigger.dataset.lightboxSrcset || "";
        if (srcset) {
          lightboxImage.srcset = srcset.split(",").map((candidate) => {
            const [path, descriptor] = candidate.trim().split(/\s+/);
            return `${Vibrosine.join(path)} ${descriptor}`;
          }).join(", ");
        } else {
          lightboxImage.removeAttribute("srcset");
        }
        lightboxImage.alt = trigger.dataset.lightboxAlt || "";
        lightboxCaption.textContent = trigger.dataset.lightboxAlt || "";
        lightbox.showModal();
        closeButton?.focus();
      });
    });
    closeButton?.addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener("cancel", (event) => {
      event.preventDefault();
      lightbox.close();
    });
    lightbox.addEventListener("close", () => {
      lightboxImage?.removeAttribute("src");
      lightboxImage?.removeAttribute("srcset");
    });
  }

  const searchInputs = [...document.querySelectorAll("input[name='q']")];
  const searchCards = [...document.querySelectorAll(".searchable-card")];
  const filterButtons = [...document.querySelectorAll("[data-course-filter]")];
  const query = new URLSearchParams(location.search).get("q") || "";
  const requestedLevel = new URLSearchParams(location.search).get("level") || "all";
  const levelMap = {
    "category-i": "Category I",
    "category-ii": "Category II",
    "category-iii": "Category III",
    other: "other"
  };
  let activeLevel = levelMap[requestedLevel] || "all";
  for (const input of searchInputs) input.value = query;

  const updateSearch = () => {
    const activeQuery = searchInputs.find((input) => input.value.trim())?.value.trim().toLowerCase() || "";
    let courseMatches = 0;
    let knowledgeMatches = 0;
    for (const card of searchCards) {
      const matchesText = !activeQuery || (card.dataset.searchText || card.textContent || "").toLowerCase().includes(activeQuery);
      const cardLevel = card.dataset.courseLevel;
      const matchesLevel = !cardLevel || activeLevel === "all" || cardLevel === activeLevel;
      const hasActiveFilter = Boolean(activeQuery) || activeLevel !== "all";
      const visible = matchesText && matchesLevel && (hasActiveFilter || card.dataset.searchDefaultHidden !== "true");
      card.hidden = !visible;
      if (visible && card.classList.contains("course-card")) courseMatches++;
      if (visible && card.classList.contains("knowledge-card")) knowledgeMatches++;
    }
    const hasCourseFilters = document.querySelector(".course-grid");
    const results = hasCourseFilters
      ? `${courseMatches} course${courseMatches === 1 ? "" : "s"}${activeQuery ? ` and ${knowledgeMatches} article${knowledgeMatches === 1 ? "" : "s"}` : ""}`
      : `${knowledgeMatches} article${knowledgeMatches === 1 ? "" : "s"}`;
    for (const status of document.querySelectorAll(".search-status, [data-course-status]")) {
      status.textContent = activeQuery || activeLevel !== "all"
        ? (courseMatches + knowledgeMatches ? results : "No matching courses or articles.")
        : "";
    }
    for (const button of filterButtons) {
      const active = (button.dataset.courseFilter || "all") === activeLevel;
      button.setAttribute("aria-pressed", String(active));
    }
  };

  for (const input of searchInputs) input.addEventListener("input", updateSearch);
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.courseFilter || "all";
      activeLevel = filter;
      updateSearch();
    });
  });
  updateSearch();

});
