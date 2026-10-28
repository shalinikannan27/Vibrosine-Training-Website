(function (global) {
  const rootAttr = () => document.body.getAttribute("data-root") || "";
  const page = () => document.body.getAttribute("data-page") || "home";
  let mediaCatalog = { items: [], gallery: [], homeGallery: [] };
  let videoCatalog = { items: [] };

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
    return `<div class="photo-placeholder" role="img" aria-label="${escapeHtml(label || "Photo placeholder")}"><span class="placeholder-mark" aria-hidden="true">V</span><span>${escapeHtml(label || "Replace with real photo")}</span></div>`;
  }

  function media(src, alt, label) {
    if (!src) return placeholder(label || alt);
    const url = join(src);
    const catalogItem = mediaBySource(src);
    const srcset = catalogItem?.srcset
      ? ` srcset="${escapeHtml(catalogItem.srcset.split(",").map((candidate) => {
          const [path, descriptor] = candidate.trim().split(/\s+/);
          return `${join(path)} ${descriptor}`;
        }).join(", "))}" sizes="(max-width: 760px) 90vw, 45vw"`
      : "";
    return `<div class="ph-media" data-placeholder="${escapeHtml(label || alt || "Replace with real photo")}"><img src="${escapeHtml(url)}"${srcset} alt="${escapeHtml(alt || "")}" loading="lazy" decoding="async"></div>`;
  }

  function mediaItem(id) {
    return mediaCatalog.items.find((item) => item.id === id);
  }

  function mediaBySource(src) {
    return mediaCatalog.items.find((item) => item.src === src);
  }

  function mediaFigure(item, className = "", lightbox = false) {
    if (!item) return "";
    const content = media(item.src, item.alt, item.caption);
    const image = lightbox
      ? `<button class="gallery-item" type="button" data-lightbox-src="${escapeHtml(join(item.src))}" data-lightbox-alt="${escapeHtml(item.alt)}" aria-label="View larger image: ${escapeHtml(item.alt)}">${content}<span class="sr-only">${escapeHtml(item.alt)}</span></button>`
      : content;
    return `<figure class="${escapeHtml(className)}">${image}<figcaption>${escapeHtml(item.caption)}</figcaption></figure>`;
  }

  function videoElement(item, className = "video-player") {
    if (!item?.src) return "";
    return `<video class="${escapeHtml(className)}" controls preload="none" playsinline poster="${escapeHtml(join(item.poster || ""))}" aria-label="${escapeHtml(item.title)}"><source src="${escapeHtml(join(item.src))}" type="video/mp4">Your browser does not support embedded video.</video>`;
  }

  function ensureLightbox() {
    if (document.querySelector("#gallery-lightbox")) return;
    document.body.insertAdjacentHTML("beforeend", `<dialog id="gallery-lightbox" class="lightbox" aria-label="Image preview"><button type="button" class="lightbox-close" aria-label="Close image preview">×</button><img alt=""><p></p></dialog>`);
  }

  function whatsappHref(base, message) {
    const url = new URL(base);
    url.searchParams.set("text", message);
    return url.toString();
  }

  function courseCard(course, contact) {
    const topics = (course.topics || []).slice(0, 5).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
    const detailHref = join("courses/course.html") + "?id=" + encodeURIComponent(course.id);
    const enquireHref = whatsappHref(contact.whatsapp, `Hello Vibrosine, I would like to enquire about ${course.title}.`);
    const coursePhoto = mediaBySource(course.image);
    return `<article class="card">
      ${media(course.image, coursePhoto?.alt || course.title, `Replace with real photo: ${course.imageName || `${course.id}.webp`}`)}
      <div class="body">
        <h3>${escapeHtml(course.title)}</h3>
        <p class="meta">${escapeHtml(course.summary)}</p>
        ${topics ? `<ul class="topics">${topics}</ul>` : ""}
        <div class="card-actions">
          <a class="btn btn-secondary" href="${detailHref}">View course</a>
          <a class="btn btn-primary" href="${escapeHtml(enquireHref)}" target="_blank" rel="noopener">Enquire about this course</a>
        </div>
      </div>
    </article>`;
  }

  function serviceCard(service, contact) {
    const enquireHref = whatsappHref(contact.whatsapp, `Hello Vibrosine, I would like to enquire about ${service.title}.`);
    const icon = service.id === "amc"
      ? '<svg aria-hidden="true" viewBox="0 0 48 48"><path d="M24 5 39 11v11c0 10-6 17-15 21C15 39 9 32 9 22V11z"/><path d="m17 24 5 5 10-11"/></svg>'
      : '<svg aria-hidden="true" viewBox="0 0 48 48"><circle cx="21" cy="21" r="13"/><path d="m30 30 10 10M16 21h10m-5-5v10"/></svg>';
    return `<article class="card service-card">
      <div class="body">
        <span class="service-icon">${icon}</span>
        <h3>${escapeHtml(service.title)}</h3>
        <p class="lead">${escapeHtml(service.summary)}</p>
        <p>${escapeHtml(service.description)}</p>
        <a class="btn btn-primary" href="${escapeHtml(enquireHref)}" target="_blank" rel="noopener">Enquire <span aria-hidden="true">→</span></a>
      </div>
    </article>`;
  }

  function headerHTML(site) {
    const home = join("index.html");
    const current = page();
    const items = [
      ["home", "index.html", "Home", current === "home"],
      ["services", "services/index.html", "Services", current === "services"],
      ["courses", "courses/index.html", "Training", current === "courses" || current === "course"],
      ["schedule", "schedule/index.html", "Sessions", current === "schedule"],
      ["gallery", "gallery/index.html", "Gallery", current === "gallery"],
      ["contact", "index.html#contact", "Contact", false]
    ];
    const links = items.map(([, href, label, on]) => {
      const cur = on ? ' aria-current="page"' : "";
      return `<li><a href="${join(href)}"${cur}>${label}</a></li>`;
    }).join("");
    return `<div class="contact-strip">
      <div class="wrap contact-strip-inner">
        <a href="${escapeHtml(site.contact.phoneHref)}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4c0 1-1 2-2 2C10 20 4 14 3 5c0-1 1-2 2-2z"/></svg>${escapeHtml(site.contact.phoneDisplay)}</a>
        <a href="mailto:${escapeHtml(site.contact.email)}"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>${escapeHtml(site.contact.email)}</a>
        <a href="${escapeHtml(whatsappHref(site.contact.whatsapp, "Hello Vibrosine, I would like to make an enquiry."))}" target="_blank" rel="noopener"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-12 7l-4 1 1-4a8 8 0 1 1 15-4z"/><path d="M9 9c1 3 2 4 5 5"/></svg>WhatsApp</a>
      </div>
    </div>
    <div class="navbar">
      <div class="wrap navbar-inner">
        <a class="brand" href="${home}" aria-label="Vibrosine home"><img src="${join(site.logo)}" alt="Vibrosine — Helping You Understand the Sign of Your Sine" width="172" height="55" fetchpriority="high"></a>
        <button id="menu-btn" aria-expanded="false" aria-controls="nav-list" aria-label="Open menu"><span></span><span></span><span></span></button>
        <nav id="main-nav" aria-label="Main navigation">
          <ul id="nav-list">
            ${links}
            <li class="nav-cta-wrap"><a class="btn btn-primary nav-cta" href="${escapeHtml(whatsappHref(site.contact.whatsapp, "Hello Vibrosine, I would like to make an enquiry."))}" target="_blank" rel="noopener">Enquire now</a></li>
          </ul>
        </nav>
      </div>
    </div>
    <button class="nav-backdrop" type="button" aria-label="Close menu" hidden></button>`;
  }

  function footerHTML(site) {
    return `<div class="wrap footer-inner">
      <div><a class="footer-brand" href="${join("index.html")}">${escapeHtml(site.shortName)}</a><p>${escapeHtml(site.tagline)}</p></div>
      <address class="footer-contact">
        <a href="${escapeHtml(site.contact.phoneHref)}">${escapeHtml(site.contact.phoneDisplay)}</a>
        <a href="mailto:${escapeHtml(site.contact.email)}">${escapeHtml(site.contact.email)}</a>
        <span>${escapeHtml(site.contact.address)}</span>
      </address>
      <p class="copyright">&copy; ${escapeHtml(site.year)} ${escapeHtml(site.name)}</p>
    </div>`;
  }

  function floatHTML(contact) {
    const href = whatsappHref(contact.whatsapp, "Hello Vibrosine, I would like to make an enquiry.");
    return `<a href="${escapeHtml(contact.phoneHref)}">Call</a><a href="${escapeHtml(href)}" target="_blank" rel="noopener">WhatsApp</a>`;
  }

  function contactListHTML(contact) {
    return `<li>Phone: <a href="${escapeHtml(contact.phoneHref)}">${escapeHtml(contact.phoneDisplay)}</a></li>
      <li>Email: <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></li>
      <li>WhatsApp: <a href="${escapeHtml(whatsappHref(contact.whatsapp, "Hello Vibrosine, I would like to make an enquiry."))}" target="_blank" rel="noopener">Chat with us</a></li>
      <li>LinkedIn: <a href="${escapeHtml(contact.linkedin)}">${escapeHtml(contact.linkedinLabel)}</a></li>`;
  }

  async function fillSiteChrome(site) {
    const header = document.querySelector("header.top");
    if (header) header.innerHTML = headerHTML(site);
    const footer = document.querySelector("footer");
    if (footer) footer.innerHTML = footerHTML(site);
    const float = document.querySelector(".float");
    if (float) float.innerHTML = floatHTML(site.contact);
    const contactList = document.querySelector("[data-bind='contact-list']");
    if (contactList) contactList.innerHTML = contactListHTML(site.contact);
    const enquiryForm = document.querySelector("[data-whatsapp-enquiry]");
    if (enquiryForm instanceof HTMLFormElement) enquiryForm.action = site.contact.whatsapp;
    const heroTitle = document.querySelector("[data-bind='hero-title']");
    if (heroTitle) heroTitle.textContent = site.hero.title;
    const heroSub = document.querySelector("[data-bind='hero-subtitle']");
    if (heroSub) heroSub.textContent = site.hero.subtitle;
    const facts = document.querySelector("[data-bind='facts']");
    if (facts) facts.innerHTML = site.facts.map((f) => `<li>${escapeHtml(f)}</li>`).join("");
    const aboutLead = document.querySelector("[data-bind='about-lead']");
    if (aboutLead) aboutLead.textContent = site.about.lead;
    const aboutTitle = document.querySelector("[data-bind='about-title']");
    if (aboutTitle) aboutTitle.textContent = site.about.title;
    const aboutStory = document.querySelector("[data-bind='about-story']");
    if (aboutStory) aboutStory.innerHTML = site.about.story.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    const aboutMedia = document.querySelector("[data-bind='about-media']");
    const aboutImage = mediaCatalog.items.find((item) => item.src === site.about.image);
    if (aboutMedia) aboutMedia.innerHTML = mediaFigure(aboutImage, "about-photo");
    const helpTitle = document.querySelector("[data-bind='help-title']");
    if (helpTitle) helpTitle.textContent = site.help.title;
    const helpItems = document.querySelector("[data-bind='help-items']");
    if (helpItems) helpItems.innerHTML = site.help.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    const teamTitle = document.querySelector("[data-bind='team-title']");
    if (teamTitle) teamTitle.textContent = site.team.title;
    const teamBody = document.querySelector("[data-bind='team-body']");
    if (teamBody) teamBody.textContent = site.team.body;
    const marketTitle = document.querySelector("[data-bind='market-title']");
    if (marketTitle) marketTitle.textContent = site.marketProspects.title;
    const marketBody = document.querySelector("[data-bind='market-body']");
    if (marketBody) marketBody.textContent = site.marketProspects.body;
    const marketDetail = document.querySelector("[data-bind='market-detail']");
    if (marketDetail) marketDetail.textContent = site.marketProspects.detail;
    const instCred = document.querySelector("[data-bind='instructor-cred']");
    if (instCred) instCred.textContent = site.instructor.credential;
    const instName = document.querySelector("[data-bind='instructor-name']");
    if (instName) instName.textContent = site.instructor.name || "Trainer name";
    const instMedia = document.querySelector("[data-bind='instructor-media']");
    const instructorImage = mediaCatalog.items.find((item) => item.src === site.instructor.image);
    if (instMedia) instMedia.innerHTML = mediaFigure(instructorImage, "instructor-photo");
    const instBio = document.querySelector("[data-bind='instructor-bio']");
    if (instBio) instBio.textContent = site.instructor.bio;
    const instTraining = document.querySelector("[data-bind='instructor-training']");
    if (instTraining) {
      instTraining.innerHTML = site.instructor.trainingGroups.map((group) =>
        `<div class="training-group"><h5>${escapeHtml(group.heading)}</h5><ul>${group.courses.map((course) => `<li>${escapeHtml(course)}</li>`).join("")}</ul></div>`
      ).join("");
    }
    const contactAddress = document.querySelector("[data-bind='contact-address']");
    if (contactAddress) contactAddress.textContent = site.contact.address;
    const organizationData = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: site.name,
      email: site.contact.email,
      telephone: site.contact.phoneDisplay,
      url: "https://vibrosine.com",
      logo: "https://vibrosine.com/" + site.logo,
      description: site.hero.subtitle
    };
    const structuredData = document.querySelector("#organization-schema");
    if (structuredData) structuredData.textContent = JSON.stringify(organizationData);
    return site;
  }

  async function renderCourses(selector, contact) {
    const host = document.querySelector(selector);
    if (!host) return;
    const data = await loadJSON("courses.json");
    const homeLimit = Number(host.dataset.homeLimit);
    const courses = Number.isInteger(homeLimit) && homeLimit > 0
      ? data.courses.slice(0, homeLimit)
      : data.courses;
    host.innerHTML = courses.map((course) => courseCard(course, contact)).join("");
    return data.courses;
  }

  async function renderServices(selector, contact) {
    const host = document.querySelector(selector);
    if (!host) return;
    const data = await loadJSON("services.json");
    host.innerHTML = data.services.map((service) => serviceCard(service, contact)).join("");
    return data.services;
  }

  async function fillCourseSelect() {
    const select = document.querySelector("select[name='course']");
    if (!select) return;
    const [data, services] = await Promise.all([loadJSON("courses.json"), loadJSON("services.json")]);
    const options = data.courses.map((c) => `<option value="${escapeHtml(c.title)}">${escapeHtml(c.title)}</option>`);
    options.push(...services.services.map((service) => `<option value="${escapeHtml(service.title)}">${escapeHtml(service.title)}</option>`));
    options.push('<option value="Not sure yet">Not sure yet</option>');
    select.innerHTML = options.join("");
  }

  async function renderSchedule() {
    const data = await loadJSON("schedule.json");
    const upcoming = document.getElementById("upcoming");
    const past = document.getElementById("past");
    if (upcoming) {
      const entries = data.upcoming || [];
      upcoming.innerHTML = entries.length
        ? `<ul class="schedule-list">${entries.map((item) => `<li class="schedule-entry"><span class="schedule-entry-name">${escapeHtml(item.title)}</span><time datetime="${escapeHtml(item.startDate)}">${escapeHtml(item.startDate)}</time></li>`).join("")}</ul>`
        : `<div class="schedule-empty"><p>Next batch dates will be announced soon. Enquire to be notified.</p><a class="btn btn-primary" href="${escapeHtml(whatsappHref("https://wa.me/919841678380", "Hello Vibrosine, please notify me when the next training batch dates are announced."))}" target="_blank" rel="noopener">Enquire to be notified</a></div>`;
    }
    const sessions = [...data.past].sort((a, b) => a.startDate.localeCompare(b.startDate));
    if (past) {
      const monthFormat = new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric" });
      const yearFormat = new Intl.DateTimeFormat("en-IN", { year: "numeric" });
      const monthYearFormat = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
      const groups = sessions.reduce((result, item) => {
        const year = yearFormat.format(new Date(`${item.startDate}T00:00:00`));
        (result[year] ||= []).push(item);
        return result;
      }, {});
      past.innerHTML = Object.entries(groups).reverse().map(([year, yearItems], yearIndex) => {
        const months = yearItems.reduce((result, item) => {
          const month = item.startDate.slice(0, 7);
          (result[month] ||= []).push(item);
          return result;
        }, {});
        const monthSections = Object.entries(months).reverse().map(([month, items], monthIndex) => {
          const monthTitle = monthYearFormat.format(new Date(`${month}-01T00:00:00`));
          const entries = items.map((item) => {
            const start = new Date(`${item.startDate}T00:00:00`);
            const end = new Date(`${item.endDate}T00:00:00`);
            const dates = item.startDate === item.endDate
              ? monthFormat.format(start)
              : `${monthFormat.format(start)} – ${monthFormat.format(end)}`;
            const meta = [item.location, item.mode].filter(Boolean).join(" · ");
            return `<li class="schedule-entry"><span class="schedule-entry-name">${escapeHtml(item.title)}${meta ? `<small>${escapeHtml(meta)}</small>` : ""}</span><time datetime="${escapeHtml(item.startDate)}">${escapeHtml(dates)}</time></li>`;
          }).join("");
          return `<details class="past-month"${yearIndex === 0 && monthIndex === 0 ? " open" : ""}><summary>${escapeHtml(monthTitle)}<span>${items.length} session${items.length === 1 ? "" : "s"}</span></summary><ul class="schedule-list">${entries}</ul></details>`;
        }).join("");
        return `<details class="past-year"${yearIndex < 2 ? " open" : ""}><summary>${escapeHtml(year)}<span>${yearItems.length} session${yearItems.length === 1 ? "" : "s"}</span></summary>${monthSections}</details>`;
      }).join("");
    }
  }

  async function renderGallery() {
    const host = document.querySelector("[data-bind='gallery']");
    if (!host) return;
    const data = await loadJSON("gallery.json");
    const intro = document.querySelector("[data-bind='gallery-intro']");
    if (intro && data.intro) intro.textContent = data.intro;
    host.innerHTML = mediaCatalog.gallery
      .map((id) => mediaFigure(mediaItem(id), "gallery-photo", true)).join("");
    ensureLightbox();
  }

  function renderHomeGallery() {
    const host = document.querySelector("[data-bind='home-gallery']");
    if (!host) return;
    host.innerHTML = mediaCatalog.homeGallery
      .map((id) => mediaFigure(mediaItem(id), "gallery-strip-item", true)).join("");
    ensureLightbox();
  }

  function renderHomeVideo() {
    const host = document.querySelector("[data-bind='home-video']");
    if (!host) return;
    host.innerHTML = videoCatalog.items.map((item) =>
      `<article class="card video-card">${videoElement(item)}<div class="body"><h3>${escapeHtml(item.title)}</h3><p class="meta">${escapeHtml(item.description)}</p></div></article>`
    ).join("");
  }

  async function renderVideos() {
    const host = document.querySelector("[data-bind='videos']");
    if (!host) return;
    const data = await loadJSON("videos.json");
    const intro = document.querySelector("[data-bind='videos-intro']");
    if (intro && data.intro) intro.textContent = data.intro;
    videoCatalog = data;
    host.innerHTML = data.items.map((item, i) => {
      const source = item.youtubeId
        ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.youtubeId)}?autoplay=1`
        : item.vimeoId ? `https://player.vimeo.com/video/${encodeURIComponent(item.vimeoId)}?autoplay=1`
          : item.src ? join(item.src) : "";
      const player = item.src
        ? videoElement(item)
        : source
          ? `<button class="video-launch" type="button" data-video-src="${escapeHtml(source)}" data-video-kind="embed" aria-label="Load and play ${escapeHtml(item.title)}">${item.poster ? media(item.poster, item.title, "") : placeholder(item.title)}<span class="play-icon" aria-hidden="true">▶</span></button>`
          : "";
      const topics = (item.topics || []).map((topic) => `<li>${escapeHtml(topic)}</li>`).join("");
      return `<article class="card video-card">${player}<div class="body"><h3>${escapeHtml(item.title || "Video")}</h3>${item.description ? `<p class="meta">${escapeHtml(item.description)}</p>` : ""}${topics ? `<ul class="video-topics">${topics}</ul>` : ""}</div></article>`;
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
        ${item.file ? `<a class="btn btn-secondary" href="${escapeHtml(href)}" download>Download PDF</a>` : `<span class="meta">Download to be added</span>`}
      </div></article>`;
    }).join("")}</div>`;
  }

  async function renderCourseDetail(contact) {
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
    const canonical = document.querySelector("link[rel='canonical']");
    if (canonical) canonical.href = `https://vibrosine.com/courses/course.html?id=${encodeURIComponent(course.id)}`;
    const openGraphTitle = document.querySelector("meta[property='og:title']");
    if (openGraphTitle) openGraphTitle.content = `${course.title} | Vibrosine`;
    const openGraphDescription = document.querySelector("meta[property='og:description']");
    if (openGraphDescription) openGraphDescription.content = course.summary;
    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) metaDescription.content = course.summary;
    const topics = (course.topics || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
    const receives = (course.receives || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    const enquireHref = whatsappHref(contact.whatsapp, `Hello Vibrosine, I would like to enquire about ${course.title}.`);
    const coursePhoto = mediaBySource(course.image);
    const courseImage = media(course.image, coursePhoto?.alt || course.title, `Replace with real photo: ${course.imageName || `${course.id}.webp`}`);
    const courseMeta = [course.duration, course.format].filter(Boolean).map(escapeHtml).join(" · ");
    const imageGroups = (course.imageGroups || []).map((group) => {
      const photos = group.items.map((photoId) => mediaItem(photoId)).filter(Boolean);
      return `<div class="course-block"><h2>${escapeHtml(group.heading)}</h2><div class="equipment-gallery">${photos.map((item) => mediaFigure(item, "equipment-photo")).join("")}</div></div>`;
    }).join("");
    const video = videoCatalog.items.find((item) => item.id === course.videoId);
    const schema = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: course.overview || course.summary,
      provider: { "@type": "EducationalOrganization", name: "Vibrosine Training and Consultancy Services", url: "https://vibrosine.com" }
    };
    const schemaElement = document.querySelector("#course-schema");
    if (schemaElement) schemaElement.textContent = JSON.stringify(schema);
    host.innerHTML = `
      <p class="crumb"><a href="${join("courses/index.html")}">Courses</a> / ${escapeHtml(course.title)}</p>
      ${courseImage}
      <h1>${escapeHtml(course.title)}</h1>
      ${courseMeta ? `<p class="meta">${courseMeta}</p>` : ""}
      <div class="course-block"><h2>Overview</h2><p class="lead">${escapeHtml(course.overview)}</p></div>
      ${topics ? `<div class="course-block">
        <h2>Topics</h2>
        <ul class="topics">${topics}</ul>
      </div>` : ""}
      ${receives ? `<div class="course-block"><h2>What participants receive</h2><ul class="topics">${receives}</ul></div>` : ""}
      ${imageGroups}
      ${video ? `<div class="course-block course-video"><h2>See it in action</h2>${videoElement(video)}<p>${escapeHtml(video.title)}</p></div>` : ""}
      <a class="btn btn-primary" href="${escapeHtml(enquireHref)}" target="_blank" rel="noopener">Enquire about this course</a>
    `;
  }

  async function boot() {
    try {
      const [site, mediaData, videoData] = await Promise.all([
        loadJSON("site.json"),
        loadJSON("media.json"),
        loadJSON("videos.json")
      ]);
      mediaCatalog = mediaData;
      videoCatalog = videoData;
      await fillSiteChrome(site);
      await Promise.all([
        renderCourses("[data-bind='courses']", site.contact),
        renderServices("[data-bind='services']", site.contact),
        fillCourseSelect(),
        renderSchedule(),
        renderGallery(),
        renderHomeGallery(),
        Promise.resolve(renderHomeVideo()),
        renderVideos(),
        renderResources(),
        renderCourseDetail(site.contact)
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
