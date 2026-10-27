# Vibrosine Training website

Static site for Vibrosine Training and Consultancy Services. This folder is the site root. Pages are HTML; courses, schedule, gallery, videos, resources and contact details live in JSON so you can update the site without editing markup.

Opening `index.html` as a file will not load the JSON. Serve the folder:

```bash
python -m http.server 8080
```

Then open http://localhost:8080

## Which JSON file to edit

| You want to update | Edit this file |
| --- | --- |
| Course titles, type (classroom/online), summary, duration, format, topics, equipment, prerequisites, instructor, image path, status | `data/courses.json` |
| Upcoming, ongoing or past batches (dates and notes) | `data/schedule.json` |
| Gallery photos and captions | `data/gallery.json` |
| Video titles, file paths, posters or embed HTML | `data/videos.json` |
| Downloadable notes and PDFs | `data/resources.json` |
| Company name, tagline, hero text, facts, about copy, instructor bio, FAQ, phone, email, WhatsApp, LinkedIn, address | `data/site.json` |

There is no price field. Do not add prices to any JSON file.

### Adding a course

Add an object to `courses` in `data/courses.json` with:

- `id` — URL slug, used as `courses/course.html?id=...`
- `title`
- `type` — `classroom` or `online`
- `summary`
- `duration`
- `format`
- `topics` — array of strings
- `equipment` — array of strings (use `[]` if none)
- `prerequisites`
- `instructor`
- `image` — path from the site root, for example `assets/images/course-name.jpg`
- `status` — for example `upcoming`, `open`, `ongoing`

Put the photo in `assets/images/`. Until the file exists, the page shows a dashed placeholder.

### Adding a schedule row

Add an object under `upcoming`, `ongoing` or `past` in `data/schedule.json`:

- `id`, `courseId` (must match a course `id`), `title`, `type`, `dates`, `notes`

### Adding photos, videos and PDFs

1. Drop files in `assets/images/`, `assets/videos/` or `assets/pdfs/`.
2. Point at them from the matching JSON file (`src`, `poster`, `file`).

## Folder map

```
vibrosine/
  index.html                 Home, about, featured courses, instructor, FAQ, contact form
  courses/index.html         Full course listing (cards from courses.json)
  courses/course.html        One reusable detail page (?id=)
  schedule/index.html        Upcoming / ongoing / past
  gallery/index.html
  videos/index.html
  resources/index.html
  css/                       tokens.css, base.css, components.css, pages.css
  js/main.js                 Menu, course filter, schedule tabs
  js/render.js               Loads JSON and builds cards
  data/                      JSON content
  assets/images|videos|pdfs|icons
  netlify.toml
```

Colours and fonts are CSS variables in `css/tokens.css`.

## Netlify

Set the Netlify publish directory to this folder. If the Git root is the parent of `vibrosine`, publish `vibrosine`. The enquiry form on the home page uses Netlify Forms (`name="enquiry"`).

Drop photos in `assets/images/`, videos in `assets/videos/`, and PDFs in `assets/pdfs/`. The wordmark is at `assets/images/logo.jpg`.
