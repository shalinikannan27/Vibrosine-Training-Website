# Vibrosine Training website

Static site for Vibrosine Training and Consultancy Services. This folder is the site root. Pages are HTML; courses, services, training sessions, photos, videos and contact details live in JSON so you can update the site without editing markup.

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
| Past training sessions and their dates | `data/schedule.json` |
| Photo inventory, captions and placements | `data/media.json` |
| Video titles, source files, posters and placements | `data/videos.json` |
| Company name, tagline, hero text, welcome story, help, instructor bio and photo, contact address, phone, email and WhatsApp | `data/site.json` |
| Brand logo and trainer portrait files | `assets/brand/` |

Keep published company information supported by supplied source material.

### Adding a course

Add an object to `courses` in `data/courses.json` with:

- `id` — URL slug, used as `courses/course.html?id=...`
- `title`
- `summary`
- `overview`
- `topics` — array of strings
- `receives` — optional array of explicitly provided participant materials and completion items
- `image` — photo path from the site root, using an item in `data/media.json`
- `duration` / `format` — include only when stated in supplied company materials

Only publish course information supported by the supplied company materials.

Add service entries to `services` in `data/services.json` with an `id`, `title`, `summary` and `description`.

### Adding a past training session

Add an object under `past` in `data/schedule.json`:

- `title` — the course/session name as recorded in the source spreadsheet
- `startDate` and `endDate` — use ISO dates (`YYYY-MM-DD`)

Do not include attendee names or contact details in schedule data.

### Media files

Optimized photos, video files and posters are stored under `assets/media/` and indexed in `data/media.json` and `data/videos.json`. Original source materials belong in the ignored `content-source/` folder and are not published.

## Folder map

```
vibrosine/
  index.html                 Home, about, services, training, instructor and WhatsApp enquiry form
  courses/index.html         Full course listing (cards from courses.json)
  courses/course.html        One reusable detail page (?id=)
  services/index.html        Service cards (from services.json)
  schedule/index.html        Training sessions
  gallery/index.html
  videos/index.html
  resources/index.html     Redirects to the videos page
  css/                       tokens.css, base.css, components.css, pages.css
  js/main.js                 Menu and WhatsApp enquiry form
  js/render.js               Loads JSON and builds cards
  data/                      JSON content
  assets/media/images|videos
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

The site uses a text wordmark and locally optimized photo and video assets.

### Real-phone QA checklist

- Check the contact strip, sticky navigation, and menu drawer at narrow phone widths; verify close-on-link, Escape, and keyboard focus behavior.
- Check the course category filters and search on both the home and course pages.
- Open each course and service enquiry link and verify the WhatsApp message is prefilled.
- Open a gallery image and close the lightbox using its button, the backdrop, and Escape.
- Confirm each local MP4 plays and displays its poster before playback.
- Submit a test enquiry and verify the entered details appear in the WhatsApp message before sending.
- Verify the phone and WhatsApp links open the expected apps and that no content is clipped by the floating contact bar.
- Run Lighthouse on mobile and check contrast, keyboard focus, image loading, and reduced-motion behavior.

## Search and page metadata

Page titles, descriptions, Open Graph metadata, `sitemap.xml`, and `robots.txt` are included. EducationalOrganization and Course structured data are generated from the site/course JSON on page load. Update the canonical host in those files if the production domain differs.
