# CMS / Front Alignment

## Scope
- Sprint 1, chantier `P0.3`.
- This note inventories the current CMS schema in `.pages.yml` against the actual frontend rendering.
- React components and JSON content were intentionally left unchanged in this pass.

## Executive Summary
- The broken French labels in `.pages.yml` were corrected so municipal editors can work in a readable CMS again.
- The schema still exposes several fields that do not have a visible and predictable public effect.
- `rich-text` is currently misleading: the frontend sanitizes and renders it as plain text, which collapses formatting and removes the value of a rich editor.

## Status Legend
- `Aligned`: field is clearly edited in CMS and rendered on the public site.
- `Partial`: field is loaded or sanitized but not rendered everywhere, or rendered in a reduced form.
- `Unwired`: field exists in CMS but is not used in the public UI.
- `Schema mismatch`: field type or structure suggests behavior the frontend does not actually support.

## Inventory

### `homepageSections` -> `public/content/site/sections.json`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `guide`, `events`, `news`, `hikes`, `parkings`, `photos` | Aligned | `src/AppRoutes.jsx`, `src/components/Navbar.jsx`, `src/pages/Home.jsx`, `src/pages/Guide.jsx` | Visibility flags are used consistently to show/hide main sections. |

### `siteContent.hero`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `eyebrow`, `eyebrowEn`, `title`, `titleEn`, `description`, `descriptionEn` | Partial | `src/pages/Home.jsx`, `src/pages/Guide.jsx` | `Guide.jsx` only uses `hero.eyebrow`; title/description are replaced by hardcoded copy. |
| `primaryCta.*` | Unwired | `src/data/loader.js` only | Sanitized in loader, never rendered on public pages. |
| `secondaryCta.*` | Unwired | `src/data/loader.js` only | Same issue as `primaryCta`. |

### `siteContent.quickLinks`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `id`, `title`, `titleEn`, `description`, `descriptionEn`, `to` | Aligned | `src/pages/Home.jsx`, `src/pages/Guide.jsx` | Used for quick links and filtered by visible sections. |

### `siteContent.highlights`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| Entire collection | Unwired | `src/data/loader.js` only | Loaded and sanitized but not rendered anywhere. |

### `siteContent.guideSections`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| Entire collection | Unwired | `src/data/loader.js` only | Editorial structure exists in CMS, but `Guide.jsx` currently uses its own hardcoded steps. |

### `siteContent.contacts`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| Entire collection | Unwired | `src/data/loader.js` only | Strong product value for municipality use, but completely absent from the UI. |

### `siteContent.visitorTips` and `siteContent.alerts`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `visitorTips`, `visitorTipsEn`, `alerts`, `alertsEn` | Aligned | `src/pages/Home.jsx`, `src/pages/Guide.jsx` | Useful and rendered in both key visitor pages. |

### `news.items`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `id`, `title`, `titleEn`, `date`, `image` | Aligned | `src/pages/News.jsx`, `src/pages/NewsDetail.jsx` | Core fields are displayed. |
| `excerpt`, `excerptEn` | Partial | `src/pages/News.jsx`, `src/pages/NewsDetail.jsx`, `src/pages/Home.jsx` | Optional and sometimes bypassed in favor of `content`. |
| `content`, `contentEn` | Schema mismatch | `src/pages/News.jsx`, `src/pages/NewsDetail.jsx`, `src/pages/Home.jsx` | Declared as `rich-text`, but flattened into a string by `sanitizeText` in `src/data/loader.js`. |

### `events.items`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `id`, `title`, `titleEn`, `startDate`, `endDate`, `location`, `image` | Aligned | `src/pages/Events.jsx`, `src/pages/EventDetail.jsx`, `src/pages/Home.jsx`, `src/components/EventsCalendar.jsx` | Used in listings, details and calendar. |
| `content`, `contentEn` | Schema mismatch | `src/pages/Events.jsx`, `src/pages/EventDetail.jsx`, `src/pages/Home.jsx` | Same `rich-text` problem as news. |
| `recurrence.frequency`, `interval`, `until`, `weekdays` | Aligned | `src/data/loader.js`, `src/utils/events.js`, `src/components/EventsCalendar.jsx`, `src/pages/Events.jsx`, `src/pages/EventDetail.jsx` | Active and meaningful. |

### `hikes.items`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `id`, `name`, `distance`, `difficulty`, `difficultyEn`, `duration`, `lat`, `lng`, `startPoint`, `startPointEn`, `gpx` | Aligned | `src/pages/Hikes.jsx`, `src/pages/HikeDetail.jsx`, `src/components/HikesInteractiveMap.jsx`, `src/components/HikeTrackMap.jsx` | Used across listing, detail and maps. |
| `description`, `descriptionEn` | Schema mismatch | `src/pages/Hikes.jsx`, `src/pages/HikeDetail.jsx` | Declared as `rich-text`, rendered as plain text. |

### `parkings.items`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `id`, `name`, `lat`, `lng`, `address`, `cars`, `minivans`, `motorcycles`, `campers`, `hourlyRate`, `dailyRate`, `notes`, `notesEn` | Aligned | `src/pages/Parking.jsx`, `src/components/ParkingsMap.jsx`, `src/components/ParkingAddressActions.jsx`, `src/pages/Home.jsx` | Public rendering exists for all listed fields. |

### `photos.items`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `title`, `titleEn`, `description`, `descriptionEn`, `photos[].image`, `photos[].alt`, `photos[].altEn`, `photos[].caption`, `photos[].captionEn` | Aligned | `src/pages/Photos.jsx`, `src/pages/Home.jsx` | Public gallery uses these fields correctly. |
| `id`, `photos[].id` | Partial | Internal React keys and sanitized IDs | Utility fields, not user-visible. This is acceptable but should stay documented. |

## Priority Recommendations

### P0
1. Remove or hide unused CMS fields until they are wired:
   - `siteContent.hero.primaryCta`
   - `siteContent.hero.secondaryCta`
   - all `siteContent.highlights`
   - all `siteContent.guideSections`
   - all `siteContent.contacts`
2. Resolve the `rich-text` mismatch:
   - either downgrade `news.content`, `events.content`, `hikes.description` to `text`
   - or implement real rich-text rendering on the frontend before keeping the current schema.

### P1
1. Decide whether `Guide.jsx` should be CMS-driven.
   - If yes, wire `siteContent.hero.title`, `siteContent.hero.description`, and `siteContent.guideSections`.
   - If no, simplify the schema and remove those fields from the CMS.
2. Decide whether the municipality wants public contact cards.
   - If yes, render `siteContent.contacts` in a practical-information page or section.
   - If no, remove the collection from `.pages.yml`.

### P2
1. Review editor-facing labels and hints beyond encoding.
   - Add clear help text for date formats and intended field usage.
   - Explain internal IDs only where they are truly needed.
2. Audit bilingual coverage.
   - Some entities like `name` do not have `nameEn`, which is acceptable only if the product decision is to keep proper names untranslated.

## Files To Revisit In A Follow-up Implementation
- `src/data/loader.js`
- `src/pages/Home.jsx`
- `src/pages/Guide.jsx`
- `src/pages/News.jsx`
- `src/pages/NewsDetail.jsx`
- `src/pages/Events.jsx`
- `src/pages/EventDetail.jsx`
- `src/pages/Hikes.jsx`
- `src/pages/HikeDetail.jsx`
- `src/pages/Photos.jsx`
