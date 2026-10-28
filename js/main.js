document.addEventListener("DOMContentLoaded", () => {
  if (window.Vibrosine) Vibrosine.boot();
});

document.addEventListener("error", (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  const wrapper = image.closest("[data-placeholder]");
  if (!wrapper) return;
  const placeholder = document.createElement("div");
  placeholder.className = "photo-placeholder";
  placeholder.setAttribute("role", "img");
  placeholder.setAttribute("aria-label", wrapper.dataset.placeholder || "Replace with real photo");
  const label = document.createElement("span");
  label.textContent = wrapper.dataset.placeholder || "Replace with real photo";
  placeholder.append(label);
  wrapper.replaceWith(placeholder);
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
    menu.querySelector("a")?.focus();
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
        const focusable = [...menu.querySelectorAll("a[href], button:not([disabled])")];
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
    });
  }

  const scheduleTabs = [...document.querySelectorAll("[data-schedule-tab]")];
  if (scheduleTabs.length) {
    scheduleTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        scheduleTabs.forEach((item) => {
          const active = item === tab;
          item.setAttribute("aria-selected", String(active));
          item.tabIndex = active ? 0 : -1;
          const panel = document.getElementById(`${item.dataset.scheduleTab}-panel`);
          if (panel) panel.hidden = !active;
        });
      });
      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const index = scheduleTabs.indexOf(tab);
        const step = event.key === "ArrowRight" ? 1 : -1;
        scheduleTabs[(index + step + scheduleTabs.length) % scheduleTabs.length].click();
        scheduleTabs[(index + step + scheduleTabs.length) % scheduleTabs.length].focus();
      });
    });
  }

  document.querySelectorAll("[data-video-src]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const source = trigger.dataset.videoSrc;
      if (!source || !(trigger instanceof HTMLButtonElement)) return;
      if (trigger.dataset.videoKind === "local") {
        const video = document.createElement("video");
        video.className = "video-frame";
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.setAttribute("aria-label", trigger.getAttribute("aria-label") || "Training video");
        const videoSource = document.createElement("source");
        videoSource.src = source;
        videoSource.type = "video/mp4";
        video.append(videoSource);
        video.addEventListener("error", () => {
          const error = document.createElement("p");
          error.className = "video-error";
          error.setAttribute("role", "alert");
          error.textContent = "This video could not be loaded. Please try again later.";
          video.replaceWith(error);
        }, { once: true });
        trigger.replaceWith(video);
        return;
      }
      const frame = document.createElement("iframe");
      frame.className = "video-frame";
      frame.src = source;
      frame.title = trigger.getAttribute("aria-label") || "Embedded video";
      frame.loading = "lazy";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.allowFullscreen = true;
      trigger.replaceWith(frame);
    });
  });
});
