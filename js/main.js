document.addEventListener("DOMContentLoaded", () => {
  if (window.Vibrosine) Vibrosine.boot();
});

document.addEventListener("vibrosine:ready", () => {
  const btn = document.getElementById("menu-btn");
  const list = document.getElementById("nav-list");
  if (btn && list) {
    btn.addEventListener("click", () => {
      const open = list.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
    list.addEventListener("click", (e) => {
      if (e.target.tagName === "A") list.classList.remove("open");
    });
  }

  document.querySelectorAll("[data-filter]").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      const f = b.dataset.filter;
      document.querySelectorAll("[data-bind='courses'] .card").forEach((c) => {
        c.hidden = !(f === "all" || c.dataset.type === f);
      });
    });
  });

  document.querySelectorAll("[role=tab]").forEach((t) => {
    t.addEventListener("click", () => {
      document.querySelectorAll("[role=tab]").forEach((x) => x.setAttribute("aria-selected", x === t));
      document.querySelectorAll(".panel").forEach((p) => {
        p.hidden = p.id !== t.dataset.panel;
      });
    });
  });
});
