# Vibrosine Training website

Static site for Vibrosine Training and Consultancy Services. This folder is the site root. Pages are HTML; courses, services, schedule, gallery, videos, resources and contact details live in JSON so you can update the site without editing markup.

Opening `index.html` as a file will not load the JSON. Serve the folder:

```bash
python -m http.server 8080
```

Then open http://localhost:8080

## Which JSON file to edit

| You want to update | Edit this file |
| --- | --- |
| Course titles, summaries, overviews and topics | `data/courses.json` |
| Consultancy and annual maintenance contract summaries and descriptions | `data/services.json` |
| Past sessions and their training dates | `data/schedule.json` |
| Gallery photos and captions | `data/gallery.json` |
| Video titles, YouTube/Vimeo IDs, and optional poster paths | `data/videos.json` |
| Downloadable notes and PDFs | `data/resources.json` |
| Company name, tagline, hero text, welcome story, help, team, market prospects, instructor bio and training, phone, email, WhatsApp, LinkedIn, address and business hours | `data/site.json` |

There is no price field. Do not add prices to any JSON file.

### Adding a course

Add an object to `courses` in `data/courses.json` with:

- `id` — URL slug, used as `courses/course.html?id=...`
- `title`
- `summary`
- `overview`
- `topics` — array of strings
- `receives` — optional array of explicitly provided participant materials and completion items
- `image` — optional photo path from the site root; when omitted, the card displays a labelled image slot for the course
- `duration` / `format` — include only when stated in supplied company materials

Only publish course information supported by the supplied company materials.

Add service entries to `services` in `data/services.json` with an `id`, `title`, `summary` and `description`. Do not add prices or unsupported dates.

### Adding a past training session

Add an object under `past` in `data/schedule.json`:

- `title` — the course/session name as recorded in the source spreadsheet
- `startDate` and `endDate` — use ISO dates (`YYYY-MM-DD`)

Do not include attendee names or contact details in schedule data.

### Adding photos, videos and PDFs

1. Drop files in `assets/images/` or `assets/pdfs/`; keep video hosting external if using YouTube or Vimeo.
2. Point at them from the matching JSON file (`src`, `poster`, `file`). Video players load only after a visitor clicks a preview.

## Folder map

```
vibrosine/
  index.html                 Home, about, services, training, instructor and WhatsApp enquiry form
  courses/index.html         Full course listing (cards from courses.json)
  courses/course.html        One reusable detail page (?id=)
  services/index.html        Service cards (from services.json)
  schedule/index.html        Past training sessions
  gallery/index.html
  videos/index.html
  resources/index.html
  css/                       tokens.css, base.css, components.css, pages.css
  js/main.js                 Menu and WhatsApp enquiry form
  js/render.js               Loads JSON and builds cards
  data/                      JSON content
  assets/images|videos|pdfs|icons
  netlify.toml
```

Colours and fonts are CSS variables in `css/tokens.css`.

## Netlify

### Connect and deploy

1. In Netlify, choose **Add new site → Import an existing project** and connect GitHub.
2. Select `shalinikannan27/Vibrosine-Training-Website` and the branch to publish.
3. Use the repository root as the publish directory (`.`). The included `netlify.toml` sets this already.
4. Deploy the site and check that all static pages and JSON data load correctly.
5. To use a custom domain later, open **Domain management → Add a domain**, enter the domain you own, then follow Netlify’s DNS instructions at your registrar and wait for HTTPS provisioning.

The enquiry form opens WhatsApp with a prefilled message using the company contact number. Verify the form and direct WhatsApp links on the deployed site.

Drop photos in `assets/images/`, videos in `assets/videos/`, and PDFs in `assets/pdfs/`. The supplied wordmark is at `assets/images/vibrosine-logo.jpeg`.

### Real-phone QA checklist

- Check the contact strip, sticky navigation, and menu drawer at narrow phone widths; verify close-on-link, Escape, and keyboard focus behavior.
- Swipe the past-session strip and course cards horizontally.
- Open each course and service enquiry link and verify the WhatsApp message is prefilled.
- Open a gallery image and close the lightbox using its button, the backdrop, and Escape.
- Confirm videos do not load an external player until the play button is pressed.
- Submit a test enquiry and verify the entered details appear in the WhatsApp message before sending.
- Verify the phone and WhatsApp links open the expected apps and that no content is clipped by the floating contact bar.
- Run Lighthouse on mobile and check contrast, keyboard focus, image loading, and reduced-motion behavior.

## Search and page metadata

Page titles, descriptions, Open Graph metadata, `sitemap.xml`, and `robots.txt` are included. EducationalOrganization and Course structured data are generated from the site/course JSON on page load. Update the canonical host in those files if the production domain differs.
