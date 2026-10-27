(function (global) {
  const rootAttr = () => document.body.getAttribute("data-root") || "";
  const page = () => document.body.getAttribute("data-page") || "home";

  function join(path) {
    const root = rootAttr();
    if (!path) return root || ".";
    const clean = String(path).replace(/^\.\//, "");
    return root ? root + "/" + clean : clean;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadJSON(file) {
    const res = await fetch(join("data/" + file));
    if (!res.ok) throw new Error("Could not load " + file);
    return res.json();
  }

  function placeholder(label) {
    return `<div class="ph">${escapeHtml(label || "Photo coming soon")}</div>`;
  }

  function media(src, alt, label) {
    if (!src) return placeholder(label || alt);
    const url = join(src);
    const fallback = escapeHtml(label || alt || "Image placeholder");
    return `<div class="ph-media"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt || "")}" onerror="this.parentElement.className='ph';this.parentElement.textContent='${fallback.replace(/'/g, "\\'")}';"></div>`;
  }

  function typeTag(type, format) {
    const online = type === "online";
    const label = format || (online ? "Online" : "Classroom");
    return `<span class="tag${online ? " online" : ""}">${escapeHtml(label)}</span>`;
  }

  function statusLabel(status) {
    return escapeHtml(status || "open");
  }

  function courseCard(course) {
    const topics = (course.topics || []).slice(0, 5).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
    const equipment = (course.equipment || []).join(", ");
    const metaBits = [course.duration, equipment].filter(Boolean).join(" · ");
    const detailHref = join("courses/course.html") + "?id=" + encodeURIComponent(course.id);
    const enquireHref = join("index.html") + "#contact";
    return `<article class="card" data-type="${escapeHtml(course.type)}">
      ${media(course.image, course.title, "Image: " + (course.title || "course"))}
      <div class="body">
        ${typeTag(course.type, course.format)}
        <h3>${escapeHtml(course.title)}</h3>
        <p class="meta">${escapeHtml(metaBits)}</p>
        <ul class="topics">${topics}</ul>
        <div class="card-actions">
          <a class="btn btn-dark" href="${detailHref}">View course</a>
          <a class="btn btn-primary" href="${enquireHref}">Enquire about this course</a>
        </div>
      </div>
    </article>`;
  }

  function scheduleCard(item) {
    return `<div class="card">
      <div class="body">
        ${typeTag(item.type)}
        <p class="date">${escapeHtml(item.dates)}</p>
        <p>${escapeHtml(item.title)}</p>
        ${item.notes ? `<p class="meta">${escapeHtml(item.notes)}</p>` : ""}
      </div>
    </div>`;
  }

  function scheduleNotice(item, contact) {
    const phone = contact && contact.phoneHref
      ? ` Call <a href="${escapeHtml(contact.phoneHref)}">${escapeHtml(contact.phoneDisplay)}</a> for exact dates.`
      : "";
    return `<div class="notice">
      <strong>${escapeHtml(item.title)}.</strong>
      <p>${escapeHtml(item.notes || "")}${phone}</p>
    </div>`;
  }

  function emptyPanel(message) {
    return `<p class="meta">${escapeHtml(message)}</p>`;
  }

  function headerHTML(site) {
    const home = join("index.html");
    const current = page();
    const items = [
      ["about", "index.html#about", "About", current === "home"],
      ["courses", "courses/index.html", "Courses", current === "courses" || current === "course"],
      ["schedule", "schedule/index.html", "Schedule", current === "schedule"],
      ["gallery", "gallery/index.html", "Gallery", current === "gallery"],
      ["videos", "videos/index.html", "Videos", current === "videos"],
      ["resources", "resources/index.html", "Resources", current === "resources"],
      ["contact", "index.html#contact", "Contact", false]
    ];
    const links = items.map(([, href, label, on]) => {
      const cur = on ? ' aria-current="page"' : "";
      return `<li><a href="${join(href)}"${cur}>${label}</a></li>`;
    }).join("");
    return `<div class="wrap">
      <a class="brand" href="${home}">VIBR<b>O</b>SINE</a>
      <button id="menu-btn" aria-expanded="false" aria-controls="nav-list" aria-label="Menu">&#9776;</button>
      <nav aria-label="Main">
        <ul id="nav-list">
          ${links}
          <li><a class="btn btn-primary nav-cta" href="${join("index.html")}#contact">Enquire now</a></li>
        </ul>
      </nav>
    </div>`;
  }

  function footerHTML(site) {
    return `<div class="wrap">&copy; ${escapeHtml(site.year)} ${escapeHtml(site.name)}. ${escapeHtml(site.tagline)}</div>`;
  }

  function floatHTML(contact) {
    return `<a href="${escapeHtml(contact.phoneHref)}">Call</a><a href="${escapeHtml(contact.whatsapp)}">WhatsApp</a>`;
  }

  function contactListHTML(contact) {
    return `<li>Phone: <a href="${escapeHtml(contact.phoneHref)}">${escapeHtml(contact.phoneDisplay)}</a></li>
      <li>Email: <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></li>
      <li>WhatsApp: <a href="${escapeHtml(contact.whatsapp)}">Chat with us</a></li>
      <li>LinkedIn: <a href="${escapeHtml(contact.linkedin)}">${escapeHtml(contact.linkedinLabel)}</a></li>
      <li>${escapeHtml(contact.address)}</li>`;
  }

  function waveSVG() {
    return `<svg class="wave" viewBox="0 0 2400 110" preserveAspectRatio="none" aria-hidden="true">
      <path class="b" d="M0 55 Q150 -10 300 55 T600 55 T900 55 T1200 55 T1500 55 T1800 55 T2100 55 T2400 55"/>
      <path class="a" d="M0 55 Q100 120 200 55 T400 55 T600 55 T800 55 T1000 55 T1200 55 T1400 55 T1600 55 T1800 55 T2000 55 T2200 55 T2400 55"/>
    </svg>`;
  }

  async function fillSiteChrome() {
    const site = await loadJSON("site.json");
    const header = document.querySelector("header.top");
    if (header) header.innerHTML = headerHTML(site);
    const footer = document.querySelector("footer");
    if (footer) footer.innerHTML = footerHTML(site);
    const float = document.querySelector(".float");
    if (float) float.innerHTML = floatHTML(site.contact);
    const contactList = document.querySelector("[data-bind='contact-list']");
    if (contactList) contactList.innerHTML = contactListHTML(site.contact);
    const heroTitle = document.querySelector("[data-bind='hero-title']");
    if (heroTitle) heroTitle.textContent = site.hero.title;
    const heroSub = document.querySelector("[data-bind='hero-subtitle']");
    if (heroSub) heroSub.textContent = site.hero.subtitle;
    const facts = document.querySelector("[data-bind='facts']");
    if (facts) facts.innerHTML = site.facts.map((f) => `<li>${escapeHtml(f)}</li>`).join("");
    const aboutLead = document.querySelector("[data-bind='about-lead']");
    if (aboutLead) aboutLead.textContent = site.about.lead;
    const aboutBody = document.querySelector("[data-bind='about-body']");
    if (aboutBody) aboutBody.textContent = site.about.body;
    const aboutMedia = document.querySelector("[data-bind='about-media']");
    if (aboutMedia) aboutMedia.innerHTML = media(site.about.image, "About Vibrosine", site.about.imageLabel);
    const instName = document.querySelector("[data-bind='instructor-name']");
    if (instName) instName.textContent = site.instructor.name;
    const instCred = document.querySelector("[data-bind='instructor-cred']");
    if (instCred) instCred.textContent = site.instructor.credential;
    const instBio = document.querySelector("[data-bind='instructor-bio']");
    if (instBio) instBio.textContent = site.instructor.bio;
    const instMedia = document.querySelector("[data-bind='instructor-media']");
    if (instMedia) instMedia.innerHTML = media(site.instructor.image, site.instructor.name, site.instructor.imageLabel);
    const faq = document.querySelector("[data-bind='faq']");
    if (faq) {
      faq.innerHTML = site.faq.map((item) =>
        `<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`
      ).join("");
    }
    const waveHost = document.querySelector("[data-bind='wave']");
    if (waveHost) waveHost.innerHTML = waveSVG();
    return site;
  }

  async function renderCourses(selector) {
    const host = document.querySelector(selector);
    if (!host) return;
    const data = await loadJSON("courses.json");
    host.innerHTML = data.courses.map(courseCard).join("");
    return data.courses;
  }

  async function fillCourseSelect() {
    const select = document.querySelector("select[name='course']");
    if (!select) return;
    const data = await loadJSON("courses.json");
    const options = data.courses.map((c) => `<option value="${escapeHtml(c.title)}">${escapeHtml(c.title)}</option>`);
    options.push('<option value="Not sure yet">Not sure yet</option>');
    select.innerHTML = options.join("");
  }

  async function renderSchedule() {
    const data = await loadJSON("schedule.json");
    const site = await loadJSON("site.json");
    const upcoming = document.getElementById("upcoming");
    const ongoing = document.getElementById("ongoing");
    const past = document.getElementById("past");
    if (upcoming) {
      upcoming.innerHTML = data.upcoming.length
        ? data.upcoming.map((item) => scheduleNotice(item, site.contact)).join("")
        : emptyPanel("No upcoming batches listed yet.");
    }
    if (ongoing) {
      ongoing.innerHTML = data.ongoing.length
        ? `<div class="grid c3">${data.ongoing.map(scheduleCard).join("")}</div>`
        : emptyPanel("No batch is running right now.");
    }
    if (past) {
      past.innerHTML = data.past.length
        ? `<div class="grid c3">${data.past.map(scheduleCard).join("")}</div>`
        : emptyPanel("No past batches listed yet.");
    }
  }

  async function renderGallery() {
    const host = document.querySelector("[data-bind='gallery']");
    if (!host) return;
    const data = await loadJSON("gallery.json");
    const intro = document.querySelector("[data-bind='gallery-intro']");
    if (intro && data.intro) intro.textContent = data.intro;
    host.innerHTML = data.items.map((item, i) =>
      media(item.src, item.alt, item.alt || "Gallery " + (i + 1))
    ).join("");
  }

  async function renderVideos() {
    const host = document.querySelector("[data-bind='videos']");
    if (!host) return;
    const data = await loadJSON("videos.json");
    const intro = document.querySelector("[data-bind='videos-intro']");
    if (intro && data.intro) intro.textContent = data.intro;
    host.innerHTML = data.items.map((item, i) => {
      let body = placeholder(item.title || "Video placeholder " + (i + 1));
      if (item.embed) {
        body = `<div class="ph-media">${item.embed}</div>`;
      } else if (item.src) {
        body = `<div class="ph-media"><video controls poster="${escapeHtml(item.poster ? join(item.poster) : "")}" src="${escapeHtml(join(item.src))}"></video></div>`;
      }
      return `<article class="card video-card">${body}<div class="body"><h3>${escapeHtml(item.title || "Video")}</h3></div></article>`;
    }).join("");
  }

  async function renderResources() {
    const host = document.querySelector("[data-bind='resources']");
    if (!host) return;
    const data = await loadJSON("resources.json");
    const intro = document.querySelector("[data-bind='resources-intro']");
    if (intro && data.intro) intro.textContent = data.intro;
    if (!data.items.length) {
      host.innerHTML = '<div class="notice">Downloads will be added here soon.</div>';
      return;
    }
    host.innerHTML = `<div class="grid c3">${data.items.map((item) => {
      const href = item.file ? join(item.file) : "#";
      return `<article class="card"><div class="body">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="meta">${escapeHtml(item.description || "")}</p>
        <a class="btn btn-dark" href="${escapeHtml(href)}" ${item.file ? "download" : ""}>Download</a>
      </div></article>`;
    }).join("")}</div>`;
  }

  async function renderCourseDetail() {
    const host = document.querySelector("[data-bind='course-detail']");
    if (!host) return;
    const id = new URLSearchParams(location.search).get("id");
    const data = await loadJSON("courses.json");
    const course = data.courses.find((c) => c.id === id);
    if (!course) {
      host.innerHTML = `<div class="notice"><strong>Course not found.</strong><p>That course id is not in courses.json. <a href="${join("courses/index.html")}">Back to courses</a>.</p></div>`;
      return;
    }
    document.title = course.title + " | Vibrosine Training";
    const topics = (course.topics || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
    const equipment = (course.equipment || []).map((e) => `<span>${escapeHtml(e)}</span>`).join("");
    host.innerHTML = `
      <p class="crumb"><a href="${join("courses/index.html")}">Courses</a> / ${escapeHtml(course.title)}</p>
      <div class="media">${media(course.image, course.title, "Image: " + course.title)}</div>
      ${typeTag(course.type, course.format)}
      <h1>${escapeHtml(course.title)}</h1>
      <p class="meta">${escapeHtml(course.duration)} · ${escapeHtml(course.format)} · Status: <span class="status-line">${statusLabel(course.status)}</span></p>
      <p class="lead">${escapeHtml(course.summary)}</p>
      <div class="course-block">
        <h2>Topics</h2>
        <ul class="topics">${topics}</ul>
      </div>
      ${equipment ? `<div class="course-block"><h2>Equipment</h2><div class="equip">${equipment}</div></div>` : ""}
      <div class="course-block">
        <h2>Prerequisites</h2>
        <p>${escapeHtml(course.prerequisites || "None listed.")}</p>
      </div>
      <div class="course-block">
        <h2>Instructor</h2>
        <p>${escapeHtml(course.instructor)}</p>
      </div>
      <a class="btn btn-primary" href="${join("index.html")}#contact">Enquire about this course</a>
    `;
  }

  async function boot() {
    try {
      await fillSiteChrome();
      await Promise.all([
        renderCourses("[data-bind='courses']"),
        fillCourseSelect(),
        renderSchedule(),
        renderGallery(),
        renderVideos(),
        renderResources(),
        renderCourseDetail()
      ]);
    } catch (err) {
      console.error(err);
    }
    document.dispatchEvent(new CustomEvent("vibrosine:ready"));
  }

  global.Vibrosine = {
    boot,
    loadJSON,
    join
  };
})(window);
