(function (global) {
  const rootAttr = () => document.body.getAttribute("data-root") || "";
  const page = () => document.body.getAttribute("data-page") || "home";
  let mediaCatalog = { items: [], gallery: [], homeGallery: [] };
  let videoCatalog = { items: [] };

  function join(path) {
    const root = rootAttr();
    const clean = String(path || "").replace(/^\.\//, "");
    return root ? `${root}/${clean}` : clean || ".";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadJSON(file) {
    const response = await fetch(join(`data/${file}`));
    if (!response.ok) throw new Error(`Could not load ${file}: ${response.status}`);
    return response.json();
  }

  function mediaItem(id) {
    return mediaCatalog.items.find((item) => item.id === id);
  }

  function mediaBySource(src) {
    return mediaCatalog.items.find((item) => item.src === src);
  }

  function imageMarkup(item, className = "") {
    if (!item) return "";
    const srcset = item.srcset
      ? ` srcset="${escapeHtml(item.srcset.split(",").map((candidate) => {
          const [path, descriptor] = candidate.trim().split(/\s+/);
          return `${join(path)} ${descriptor}`;
        }).join(", "))}" sizes="(max-width: 760px) 90vw, 45vw"`
      : "";
    return `<div class="ph-media ${escapeHtml(className)}"><img src="${escapeHtml(join(item.src))}"${srcset} alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async"></div>`;
  }

  function mediaFigure(item, className = "", lightbox = false, caption = item?.caption) {
    if (!item) return "";
    const image = imageMarkup(item);
    const display = lightbox
      ? `<button class="gallery-item" type="button" data-lightbox-src="${escapeHtml(join(item.src))}" data-lightbox-srcset="${escapeHtml(item.srcset || "")}" data-lightbox-alt="${escapeHtml(item.alt)}" aria-label="View larger image: ${escapeHtml(item.alt)}">${image}</button>`
      : image;
    return `<figure class="${escapeHtml(className)}">${display}${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>`;
  }

  function videoElement(item, className = "video-player") {
    if (!item?.src || !item.poster) return "";
    return `<video class="${escapeHtml(className)}" controls preload="none" playsinline poster="${escapeHtml(join(item.poster))}" aria-label="${escapeHtml(item.title)}"><source src="${escapeHtml(join(item.src))}" type="video/mp4">Your browser does not support embedded video.</video>`;
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

  function courseLevel(course) {
    const title = `${course.title} ${course.summary}`;
    if (/category\s*i\b/i.test(title)) return "Category I";
    if (/category\s*ii\b|level\s*ii\b/i.test(title)) return "Category II";
    if (/category\s*iii\b|level\s*iii\b/i.test(title)) return "Category III";
    if (/category\s*iv\b|level\s*iv\b/i.test(title)) return "Category IV";
    return "";
  }

  function courseCard(course, contact, hiddenByDefault = false) {
    const level = courseLevel(course);
    const coursePhoto = mediaBySource(course.image);
    const detailHref = `${join("courses/course.html")}?id=${encodeURIComponent(course.id)}`;
    const enquireHref = whatsappHref(contact.whatsapp, `Hello Vibrosine, I would like to enquire about ${course.title}.`);
    const topics = (course.topics || []).slice(0, 3).map((topic) => `<li>${escapeHtml(topic)}</li>`).join("");
    const searchText = [course.title, course.summary, ...(course.topics || []), level].join(" ");
    return `<article class="card course-card searchable-card"${hiddenByDefault ? " hidden" : ""} data-search-default-hidden="${hiddenByDefault}" data-search-text="${escapeHtml(searchText.toLowerCase())}" data-course-level="${escapeHtml(level || "other")}">
      ${imageMarkup(coursePhoto)}
      <div class="body">
        ${level ? `<span class="tag level-badge">${escapeHtml(level)}</span>` : ""}
        <h3>${escapeHtml(course.title)}</h3>
        <p class="meta">${escapeHtml(course.summary)}</p>
        ${topics ? `<ul class="topics">${topics}</ul>` : ""}
        <div class="card-actions">
          <a class="btn btn-secondary" href="${detailHref}">View course</a>
          <a class="btn btn-primary" href="${escapeHtml(enquireHref)}" target="_blank" rel="noopener">Enquire</a>
        </div>
      </div>
    </article>`;
  }

  function serviceCard(service, contact) {
    const enquireHref = whatsappHref(contact.whatsapp, `Hello Vibrosine, I would like to enquire about ${service.title}.`);
    return `<article class="card service-card" id="${escapeHtml(service.id)}">
      <div class="body">
        <h3>${escapeHtml(service.title)}</h3>
        <p class="lead">${escapeHtml(service.summary)}</p>
        <p>${escapeHtml(service.description)}</p>
        <a class="btn btn-primary" href="${escapeHtml(enquireHref)}" target="_blank" rel="noopener">Enquire <span aria-hidden="true">→</span></a>
      </div>
    </article>`;
  }

  function headerHTML(site) {
    const home = join("index.html");
    const contact = site.contact;
    const enquiry = whatsappHref(contact.whatsapp, "Hello Vibrosine, I would like to make an enquiry.");
    const currentQuery = new URLSearchParams(location.search).get("q") || "";
    const trainingLinks = [
      `<li><a href="${join("courses/index.html")}">All training courses</a></li>`,
      `<li><a href="${join("courses/course.html?id=two-day-online-course")}">Online course</a></li>`,
      `<li><a href="${join("courses/course.html?id=advanced-vibration-analysis-training")}">Hands-on advanced course</a></li>`,
      ...["category-i", "category-ii", "category-iii"].map((level, index) =>
        `<li><a href="${join(`courses/index.html?level=${level}`)}">Category ${["I", "II", "III"][index]}</a></li>`)
    ].join("");
    const serviceLinks = [
      `<li><a href="${join("services/index.html#consultancy-services")}">Consultancy</a></li>`,
      `<li><a href="${join("services/index.html#amc")}">AMC</a></li>`
    ].join("");
    const resourceLinks = `<li><a href="${join("videos/index.html")}">Videos</a></li>`;
    return `<div class="contact-strip"><div class="wrap contact-strip-inner">
      <a href="${escapeHtml(contact.phoneHref)}">${escapeHtml(contact.phoneDisplay)}</a>
      <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>
    </div></div>
    <div class="navbar"><div class="wrap navbar-inner">
      <a class="brand" href="${home}" aria-label="Vibrosine home"><img src="${join(site.brandLogo)}" alt="" width="190" height="60"></a>
      <button id="menu-btn" aria-expanded="false" aria-controls="nav-list" aria-label="Open menu"><span></span><span></span><span></span></button>
      <nav id="main-nav" aria-label="Main navigation"><ul id="nav-list">
        <li><a href="${home}#about">About</a></li>
        <li><details class="nav-group"><summary>Training</summary><ul class="nav-submenu">${trainingLinks}</ul></details></li>
        <li><details class="nav-group"><summary>Services</summary><ul class="nav-submenu">${serviceLinks}</ul></details></li>
        <li><a href="${join("schedule/index.html")}">Sessions</a></li>
        <li><details class="nav-group"><summary>Resources</summary><ul class="nav-submenu">${resourceLinks}</ul></details></li>
        <li><a href="${join("gallery/index.html")}">Gallery</a></li>
        <li><a href="${home}#contact">Contact</a></li>
        <li class="nav-search-item"><form class="nav-search" role="search" action="${home}#site-search" method="get"><label class="sr-only" for="nav-search-input">Search courses</label><input id="nav-search-input" type="search" name="q" value="${escapeHtml(currentQuery)}" placeholder="Search courses"><button type="submit" aria-label="Search">⌕</button></form></li>
        <li class="nav-cta-wrap"><a class="btn btn-primary nav-cta" href="${escapeHtml(enquiry)}" target="_blank" rel="noopener">Enquire now</a></li>
      </ul></nav>
    </div></div>
    <button class="nav-backdrop" type="button" aria-label="Close menu" hidden></button>`;
  }

  function footerHTML(site) {
    const contact = site.contact;
    return `<div class="wrap footer-grid">
      <div class="footer-about"><a class="footer-brand" href="${join("index.html")}"><img src="${escapeHtml(join(site.brandLogo))}" alt="${escapeHtml(site.name)}"></a></div>
      <div><h2>Courses</h2><ul><li><a href="${join("courses/index.html")}">Training courses</a></li><li><a href="${join("courses/index.html?level=category-i")}">Category I</a></li><li><a href="${join("courses/index.html?level=category-ii")}">Category II</a></li><li><a href="${join("courses/index.html?level=category-iii")}">Category III</a></li></ul></div>
      <div><h2>Services</h2><ul><li><a href="${join("services/index.html#consultancy-services")}">Consultancy</a></li><li><a href="${join("services/index.html#amc")}">AMC</a></li></ul></div>
      <div><h2>Vibrosine</h2><ul><li><a href="${join("index.html#about")}">About</a></li><li><a href="${join("schedule/index.html")}">Sessions</a></li><li><a href="${join("gallery/index.html")}">Gallery</a></li><li><a href="${join("videos/index.html")}">Videos</a></li><li><a href="${join("index.html#contact")}">Contact</a></li></ul></div>
      <address class="footer-contact"><h2>Contact</h2><a href="${escapeHtml(contact.phoneHref)}">${escapeHtml(contact.phoneDisplay)}</a><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a><a href="${escapeHtml(contact.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a><span>${escapeHtml(contact.address)}</span></address>
      <p class="copyright">&copy; ${escapeHtml(site.year)} ${escapeHtml(site.name)}</p>
    </div>`;
  }

  function floatHTML(contact) {
    const href = whatsappHref(contact.whatsapp, "Hello Vibrosine, I would like to make an enquiry.");
    return `<a href="${escapeHtml(contact.phoneHref)}">Call</a><a href="${escapeHtml(href)}" target="_blank" rel="noopener">WhatsApp</a>`;
  }

  function contactListHTML(contact) {
    const enquiry = whatsappHref(contact.whatsapp, "Hello Vibrosine, I would like to make an enquiry.");
    return `<li>Phone: <a href="${escapeHtml(contact.phoneHref)}">${escapeHtml(contact.phoneDisplay)}</a></li>
      <li>Email: <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></li>
    <li>LinkedIn: <a href="${escapeHtml(contact.linkedin)}" target="_blank" rel="noopener noreferrer">Vibrosine Training and Consultancy Services</a></li>
    <li>WhatsApp: <a href="${escapeHtml(enquiry)}" target="_blank" rel="noopener">Chat with us</a></li>
      <li class="contact-address">Address: ${escapeHtml(contact.address)}</li>`;
  }

  function pillarMarkup(title, summary, href, linkLabel) {
    return `<article class="card pillar-card">
      <div class="body"><p class="eyebrow">${escapeHtml(title)}</p><h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(summary)}</p><a class="text-link" href="${join(href)}">${escapeHtml(linkLabel)} <span aria-hidden="true">→</span></a></div>
    </article>`;
  }

  function renderPillars() {
    const host = document.querySelector("[data-bind='pillars']");
    if (!host) return;
    host.innerHTML = [
      pillarMarkup("Training", "Training courses for technicians, supervisors and engineers, with workshops and demonstrations.", "courses/index.html", "Explore training"),
      pillarMarkup("Consultancy", "Investigate equipment troubles, analyze vibration and recommend corrective tasks.", "services/index.html#consultancy-services", "Explore consultancy"),
      pillarMarkup("AMC", "Annual maintenance support for selected troublesome machines and monthly performance reporting.", "services/index.html#amc", "Explore AMC")
    ].join("");
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
    const instructorPhoto = document.querySelector("[data-bind='instructor-photo']");
    if (instructorPhoto) {
      instructorPhoto.innerHTML = `<img src="${escapeHtml(join(site.instructor.image))}" alt="Mr. Srinivasa Raghavan Balaji" width="1400" height="707" loading="lazy" decoding="async">`;
    }
    const enquiryForm = document.querySelector("[data-whatsapp-enquiry]");
    if (enquiryForm instanceof HTMLFormElement) enquiryForm.action = site.contact.whatsapp;
    const setText = (selector, value) => {
      const element = document.querySelector(selector);
      if (element && value) element.textContent = value;
    };
    setText("[data-bind='hero-title']", site.hero.title);
    setText("[data-bind='hero-subtitle']", site.hero.subtitle);
    setText("[data-bind='about-title']", site.about.title);
    setText("[data-bind='about-lead']", site.about.lead);
    setText("[data-bind='help-title']", site.help.title);
    setText("[data-bind='instructor-cred']", site.instructor.credential);
    setText("[data-bind='instructor-bio']", site.instructor.bio);
    const facts = document.querySelector("[data-bind='facts']");
    if (facts) facts.innerHTML = site.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("");
    const story = document.querySelector("[data-bind='about-story']");
    if (story) story.innerHTML = site.about.story.map((text) => `<p>${escapeHtml(text)}</p>`).join("");
    const helpItems = document.querySelector("[data-bind='help-items']");
    if (helpItems) helpItems.innerHTML = site.help.items.map((text) => `<li>${escapeHtml(text)}</li>`).join("");
    const aboutImage = document.querySelector("[data-bind='about-media']");
    const aboutPhoto = mediaBySource(site.about.image);
    if (aboutImage) aboutImage.innerHTML = mediaFigure(aboutPhoto, "about-photo", false, aboutPhoto?.aboutCaption || aboutPhoto?.caption);
    renderPillars();
    const structuredData = document.querySelector("#organization-schema");
    if (structuredData) {
      structuredData.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: site.name,
        email: site.contact.email,
        telephone: site.contact.phoneDisplay,
        url: "https://vibrosine.com",
        description: site.hero.subtitle
      });
    }
  }

  async function renderCourses(contact) {
    const hosts = document.querySelectorAll("[data-bind='courses']");
    if (!hosts.length) return;
    const data = await loadJSON("courses.json");
    for (const host of hosts) {
      const homeLimit = Number(host.dataset.homeLimit);
      host.innerHTML = data.courses.map((course, index) =>
        courseCard(course, contact, Number.isInteger(homeLimit) && homeLimit > 0 && index >= homeLimit)
      ).join("");
    }
  }

  async function renderServices(contact) {
    const host = document.querySelector("[data-bind='services']");
    if (!host) return;
    const data = await loadJSON("services.json");
    host.innerHTML = data.services.map((service) => serviceCard(service, contact)).join("");
  }

  async function fillCourseSelect() {
    const select = document.querySelector("select[name='course']");
    if (!select) return;
    const [courses, services] = await Promise.all([loadJSON("courses.json"), loadJSON("services.json")]);
    const options = courses.courses.map((course) => `<option value="${escapeHtml(course.title)}">${escapeHtml(course.title)}</option>`);
    options.push(...services.services.map((service) => `<option value="${escapeHtml(service.title)}">${escapeHtml(service.title)}</option>`));
    options.push('<option value="Not sure yet">Not sure yet</option>');
    select.innerHTML = options.join("");
  }

  function formatDate(dateString, options) {
    return new Intl.DateTimeFormat("en-IN", options).format(new Date(`${dateString}T00:00:00`));
  }

  function dateRange(item) {
    const start = new Date(`${item.startDate}T00:00:00`);
    const end = new Date(`${item.endDate}T00:00:00`);
    const sameMonth = item.startDate.slice(0, 7) === item.endDate.slice(0, 7);
    if (item.startDate === item.endDate) return formatDate(item.startDate, { day: "numeric", month: "short", year: "numeric" });
    if (sameMonth) {
      return `${start.getDate()}–${formatDate(item.endDate, { day: "numeric", month: "short", year: "numeric" })}`;
    }
    return `${formatDate(item.startDate, { day: "numeric", month: "short" })} – ${formatDate(item.endDate, { day: "numeric", month: "short", year: "numeric" })}`;
  }

  function scheduleEntry(item) {
    const details = [
      item.mode && !/to be confirmed/i.test(item.mode) ? `<span><strong>Format:</strong> ${escapeHtml(item.mode)}</span>` : "",
      item.location && !/to be confirmed/i.test(item.location) ? `<span><strong>Location:</strong> ${escapeHtml(item.location)}</span>` : ""
    ].filter(Boolean);
    return `<li class="session-item"><time class="session-date" datetime="${escapeHtml(item.startDate)}">${escapeHtml(dateRange(item))}</time><article class="session-card"><h2 class="session-title">${escapeHtml(item.title)}</h2>${details.length ? `<p class="session-meta">${details.join("")}</p>` : ""}</article></li>`;
  }

  async function renderSchedule() {
    const past = document.getElementById("past");
    const recent = document.querySelector("[data-bind='recent-training']");
    if (!past && !recent) return;
    const data = await loadJSON("schedule.json");
    const sessions = [...(data.past || [])].sort((a, b) => b.startDate.localeCompare(a.startDate));
    if (past) {
      past.innerHTML = sessions.length
        ? `<ol class="session-timeline" aria-label="Past training sessions">${sessions.map(scheduleEntry).join("")}</ol>`
        : `<p class="schedule-empty">No recorded training sessions yet.</p>`;
    }
    if (recent) {
      const recentImages = ["photo-02", "photo-19", "photo-32"];
      const seenTitles = new Set();
      const recentSessions = sessions.filter((item) => {
        const title = item.title.trim().toLocaleLowerCase();
        if (seenTitles.has(title)) return false;
        seenTitles.add(title);
        return true;
      }).slice(0, 3);
      recent.innerHTML = recentSessions.map((item, index) =>
        `<article class="card training-batch">${imageMarkup(mediaItem(recentImages[index]))}<div class="body"><h3>${escapeHtml(item.title)}</h3><p class="meta">${escapeHtml(dateRange(item))}</p>${item.location || item.mode ? `<p class="batch-meta">${escapeHtml([item.location, item.mode].filter((value) => value && !/to be confirmed/i.test(value)).join(" · "))}</p>` : ""}<a class="text-link" href="${join("schedule/index.html")}">View training <span aria-hidden="true">→</span></a></div></article>`
      ).join("");
    }
  }

  function renderGallery() {
    const host = document.querySelector("[data-bind='gallery']");
    if (!host) return;
    host.innerHTML = mediaCatalog.gallery.map((id) => mediaFigure(mediaItem(id), "gallery-photo", true)).join("");
    ensureLightbox();
  }

  function renderVideos() {
    const pageHost = document.querySelector("[data-bind='videos']");
    const homeHost = document.querySelector("[data-bind='home-video']");
    const intro = document.querySelector("[data-bind='videos-intro']");
    if (intro) intro.textContent = "Equipment demonstrations from Vibrosine training sessions.";
    const markup = videoCatalog.items.map((item) =>
      `<article class="card video-card">${videoElement(item)}<div class="body"><h3>${escapeHtml(item.title)}</h3><p class="meta">${escapeHtml(item.description)}</p></div></article>`
    ).join("");
    if (pageHost) pageHost.innerHTML = markup;
    if (homeHost) {
      const featured = ["rotor-gearbox-training-kit", "rigid-flexible-rotor-balancing"]
        .map((id) => videoCatalog.items.find((item) => item.id === id))
        .filter((item) => item);
      homeHost.innerHTML = featured.map((item) =>
        `<article class="card video-card home-video-card">${videoElement(item)}<div class="body"><h3>${escapeHtml(item.title)}</h3><p class="meta">${escapeHtml(item.description)}</p><a href="${join("videos/index.html")}">View all videos <span aria-hidden="true">→</span></a></div></article>`
      ).join("");
    }
  }

  async function renderCourseDetail(contact) {
    const host = document.querySelector("[data-bind='course-detail']");
    if (!host) return;
    const id = new URLSearchParams(location.search).get("id");
    const data = await loadJSON("courses.json");
    const course = data.courses.find((item) => item.id === id);
    if (!course) {
      host.innerHTML = `<div class="notice"><strong>Course not found.</strong><p><a href="${join("courses/index.html")}">Browse training courses</a>.</p></div>`;
      return;
    }
    document.title = `${course.title} | Vibrosine`;
    const canonical = document.querySelector("link[rel='canonical']");
    if (canonical) canonical.href = `https://vibrosine.com/courses/course.html?id=${encodeURIComponent(course.id)}`;
    const description = document.querySelector("meta[name='description']");
    if (description) description.content = course.summary;
    const level = courseLevel(course);
    const photo = mediaBySource(course.image);
    const topics = (course.topics || []).map((topic) => `<li>${escapeHtml(topic)}</li>`).join("");
    const receives = (course.receives || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
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
    const enquiry = whatsappHref(contact.whatsapp, `Hello Vibrosine, I would like to enquire about ${course.title}.`);
    const courseImage = photo ? mediaFigure(photo, "course-main-image") : "";
    host.innerHTML = `<p class="crumb"><a href="${join("courses/index.html")}">Courses</a> / ${escapeHtml(course.title)}</p>
      ${courseImage}${level ? `<span class="tag level-badge">${escapeHtml(level)}</span>` : ""}
      <h1>${escapeHtml(course.title)}</h1>
      ${course.duration || course.format ? `<p class="meta">${escapeHtml([course.duration, course.format].filter(Boolean).join(" · "))}</p>` : ""}
      <div class="course-block"><h2>Overview</h2><p class="lead">${escapeHtml(course.overview || course.summary)}</p></div>
      ${topics ? `<div class="course-block"><h2>Topics</h2><ul class="topics">${topics}</ul></div>` : ""}
      ${receives ? `<div class="course-block"><h2>What participants receive</h2><ul class="topics">${receives}</ul></div>` : ""}
      ${video ? `<div class="course-block course-video"><h2>See it in action</h2>${videoElement(video)}<p>${escapeHtml(video.title)}</p></div>` : ""}
      <a class="btn btn-primary" href="${escapeHtml(enquiry)}" target="_blank" rel="noopener">Enquire about this course</a>`;
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
        renderCourses(site.contact),
        renderServices(site.contact),
        fillCourseSelect(),
        renderSchedule(),
        Promise.resolve(renderGallery()),
        renderVideos(),
        renderCourseDetail(site.contact)
      ]);
    } catch (error) {
      console.error("Vibrosine page content could not be rendered.", error);
    } finally {
      document.dispatchEvent(new CustomEvent("vibrosine:ready"));
    }
  }

  global.Vibrosine = { boot, loadJSON, join };
})(window);
