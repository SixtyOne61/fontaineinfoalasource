# CMS / Front Alignment

## Scope
- Updated after Sprint 2 integration.
- Reflects the final public rendering actually present in `Home.jsx` and `Guide.jsx`.
- Focuses on what municipal editors can now trust in `.pages.yml`.

## Executive Summary
- Sprint 2 made the CMS more useful because the public site now renders more of `siteContent`.
- The biggest previous mismatch, `rich-text` rendered as plain text, has been resolved by downgrading those fields to `text` in the CMS.
- `hero` CTAs, `quickLinks.badge`, `highlights`, `guideSections`, and `contacts` are now public and should stay editable.
- The remaining work is mostly cleanup and consistency, not major structural mismatch.

## Status Legend
- `Aligned`: edited in CMS and clearly rendered publicly.
- `Partial`: rendered publicly, but only in some pages or in a simplified way.
- `Technical only`: kept for data/model reasons but not meant as user-facing content.

## Inventory

### `homepageSections` -> `public/content/site/sections.json`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `guide`, `events`, `news`, `hikes`, `parkings`, `photos` | Aligned | `src/AppRoutes.jsx`, `src/components/Navbar.jsx`, `src/pages/Home.jsx`, `src/pages/Guide.jsx` | Visibility logic is coherent and useful. |

### `siteContent.hero`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `eyebrow`, `eyebrowEn`, `title`, `titleEn`, `description`, `descriptionEn` | Aligned | `src/pages/Home.jsx`, `src/pages/Guide.jsx` | Visible in both key entry pages. |
| `primaryCta.*` | Aligned | `src/pages/Home.jsx`, `src/pages/Guide.jsx` | Rendered conditionally when the linked section is active. |
| `secondaryCta.*` | Aligned | `src/pages/Home.jsx`, `src/pages/Guide.jsx` | Same behavior as primary CTA. |

### `siteContent.quickLinks`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `id`, `title`, `titleEn`, `description`, `descriptionEn`, `to` | Aligned | `src/pages/Home.jsx`, `src/pages/Guide.jsx` | Used as public cards and shortcut links. |
| `badge`, `badgeEn` | Aligned | `src/pages/Home.jsx` | Visible on action cards and now worth keeping in CMS. |

### `siteContent.highlights`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| Entire collection | Aligned | `src/pages/Home.jsx` | Used in entry journeys and practical cue cards. |

### `siteContent.guideSections`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| Entire collection | Aligned | `src/pages/Guide.jsx` | Guide is now genuinely CMS-driven for these sections. |

### `siteContent.contacts`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| Entire collection | Aligned | `src/pages/Guide.jsx` | Public contact cards now exist and justify the schema. |

### `siteContent.visitorTips` and `siteContent.alerts`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `visitorTips`, `visitorTipsEn`, `alerts`, `alertsEn` | Aligned | `src/pages/Home.jsx`, `src/pages/Guide.jsx` | Strong practical value for visitors and residents. |

### `news.items`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `id`, `title`, `titleEn`, `date`, `excerpt`, `excerptEn`, `content`, `contentEn`, `image` | Aligned | `src/pages/News.jsx`, `src/pages/NewsDetail.jsx`, `src/pages/Home.jsx` | CMS type now matches actual plain-text rendering. |

### `events.items`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `id`, `title`, `titleEn`, `startDate`, `endDate`, `location`, `content`, `contentEn`, `image` | Aligned | `src/pages/Events.jsx`, `src/pages/EventDetail.jsx`, `src/pages/Home.jsx` | Plain-text schema is now honest. |
| `recurrence.frequency`, `interval`, `until`, `weekdays` | Aligned | `src/data/loader.js`, `src/utils/events.js`, `src/components/EventsCalendar.jsx`, `src/pages/Events.jsx`, `src/pages/EventDetail.jsx` | Still meaningful and correctly wired. |

### `hikes.items`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `id`, `name`, `distance`, `difficulty`, `difficultyEn`, `duration`, `lat`, `lng`, `startPoint`, `startPointEn`, `description`, `descriptionEn`, `gpx` | Aligned | `src/pages/Hikes.jsx`, `src/pages/HikeDetail.jsx`, `src/components/HikesInteractiveMap.jsx`, `src/components/HikeTrackMap.jsx` | Plain-text schema is now honest here too. |

### `parkings.items`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `id`, `name`, `lat`, `lng`, `address`, `cars`, `minivans`, `motorcycles`, `campers`, `hourlyRate`, `dailyRate`, `notes`, `notesEn` | Aligned | `src/pages/Parking.jsx`, `src/components/ParkingsMap.jsx`, `src/components/ParkingAddressActions.jsx`, `src/pages/Home.jsx` | No major mismatch in the current pass. |

### `photos.items`
| Field | Status | Front usage | Notes |
| --- | --- | --- | --- |
| `title`, `titleEn`, `description`, `descriptionEn`, `photos[].image`, `photos[].alt`, `photos[].altEn`, `photos[].caption`, `photos[].captionEn` | Aligned | `src/pages/Photos.jsx`, `src/pages/Home.jsx` | Gallery rendering matches the model. |
| `id`, `photos[].id` | Technical only | Internal keys and sanitized IDs | Needed for stable content identity, not for public messaging. |

## Decisions Confirmed
1. `news.content`, `news.contentEn`, `events.content`, `events.contentEn`, `hikes.description`, and `hikes.descriptionEn` stay as `text`, not `rich-text`.
2. `hero.primaryCta`, `hero.secondaryCta`, `quickLinks.badge`, `highlights`, `guideSections`, and `contacts` stay exposed in the CMS because Sprint 2 now renders them publicly.
3. Editor help text should remain explicit about:
- technical IDs
- internal route values
- date formats
- plain-text-only content
- practical, short, reliable municipal copy

## Remaining Follow-up Work

### P1 / P2 product follow-up
- Decide whether `highlights` should also appear outside the home.
- Decide whether a dedicated `Infos pratiques` page should eventually replace or extend `Guide`.
- Consider adding validity dates or priority flags for alerts and practical information.

### Technical follow-up
- `src/data/loader.js` still contains logic for fields that are now correctly rendered but could benefit from tighter typing and cleaner fallbacks.
- If richer editorial formatting becomes necessary, implement a true rendering strategy before reintroducing any rich-text field type.

## Files Reviewed Against This Alignment
- `.pages.yml`
- `src/pages/Home.jsx`
- `src/pages/Guide.jsx`
- `src/data/loader.js`
