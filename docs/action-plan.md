# Action Plan

## Goal

Turn the app into a reliable, practical, easy-to-edit municipal product for Fontaine-de-Vaucluse.

The product target stays constant:
- useful for tourists and residents;
- friendly in tone, but concrete;
- easy to maintain by municipal elected officials through the CMS;
- strong on mobile, clarity, and trust.

## Target State

A user should be able to:
- understand how to arrive, park, and move around quickly;
- check the most important local information of the day without searching across pages;
- find practical village information that feels official and current;
- discover events and walks through useful, structured details;
- trust that the information is readable, current, and intentional.

A municipal editor should be able to:
- understand what each CMS field changes on the site;
- publish urgent updates without uncertainty;
- avoid formatting surprises and dead fields;
- maintain the site without technical help for normal updates.

## Recommended Execution Order

1. Restore trust basics: text quality, encoding, clear loading and error states.
2. Align CMS and frontend so edited fields have visible outcomes.
3. Add the practical municipal information layer.
4. Rework entry journeys and home-page priorities.
5. Enrich domain pages such as parking, events, and walks.

## P0

### P0.1 Fix encoding and core French copy

Why it matters:
- broken French instantly damages credibility;
- municipal trust depends on polish and readability.

Main work:
- clean encoding issues in UI labels, content JSON, and CMS labels;
- normalize navigation labels, CTA text, empty states, and detail-page copy;
- keep the tone friendly, short, and practical.

Acceptance:
- no visible broken characters in the app or CMS labels;
- key actions and system messages read naturally in French;
- baseline English labels remain coherent where present.

### P0.2 Make dynamic states reliable

Why it matters:
- detail pages currently risk showing false `not found` states before data finishes loading;
- municipal information must not look unstable on weak mobile networks.

Main work:
- introduce explicit `loading`, `loaded`, `empty`, `error`, and `notFound` states;
- fix route-level initial loading behavior;
- ensure detail pages only show `not found` after data resolution.

Acceptance:
- no false error screen on slow loading;
- first app load is coherent;
- empty data and real errors are clearly distinguished.

### P0.3 Align CMS fields with frontend rendering

Why it matters:
- editors must trust that what they enter is what the public sees;
- unused or misleading fields create long-term editorial drift.

Main work:
- map CMS fields to real frontend usage;
- connect useful orphan fields;
- remove or deprecate dead fields;
- decide how rich text should be supported and rendered.

Acceptance:
- every CMS field is either used or deliberately removed;
- editors can predict the public result of their changes;
- long content remains readable and structured.

## P1

### P1.1 Build a practical municipal information layer

Why it matters:
- the app should answer common real-life questions without forcing users into news or search loops.

Main work:
- add a strong `Infos pratiques` area;
- cover contacts, opening hours, access, parking guidance, toilets, water, PMR, pets, heat, circulation, and local constraints;
- show last-update context where it matters.

Acceptance:
- a visitor can find key logistical information in a few taps;
- a resident can find essential municipal info quickly;
- sensitive practical information displays update context.

### P1.2 Rework entry journeys

Why it matters:
- today the product is more visitor-oriented than audience-aware;
- tourists, day visitors, and residents need clearer entry points.

Main work:
- structure the home around simple journeys such as:
- `Je visite aujourd'hui`
- `Je prepare ma venue`
- `Je suis habitant`
- move critical actions above inspirational blocks;
- make each page's primary action obvious.

Acceptance:
- the home clearly exposes distinct user paths;
- mobile users can identify where to go next without hesitation;
- practical actions are visually prioritized.

### P1.3 Make parking, events, and walks decision-grade

Why it matters:
- these pages should help users decide, not just browse.

Main work:
- parking: walking distance, payment mode, access logic, constraints, map-first usefulness;
- events: category, audience, booking, free/paid, cancellation, accessibility;
- walks: effort, duration realism, elevation, shade, pets, stroller suitability, exact start logic.

Acceptance:
- each page answers its main user question quickly;
- structured facts appear before long descriptive copy;
- editors can fill the needed fields without complexity blow-up.

## P2

### P2.1 Improve municipal publishing workflow

Why it matters:
- the product only stays good if publication stays simple.

Main work:
- improve CMS labels, hints, and field guidance;
- add publishing checklists and validation guidance;
- introduce validity windows, priority, or draft/published support if the tooling allows it.

Acceptance:
- a non-technical editor can publish normal content safely;
- ambiguous fields are reduced or documented;
- temporary information is easier to manage.

### P2.2 Keep product vision stable across Codex runs

Why it matters:
- future work should keep the same municipal and UX direction.

Main work:
- maintain `AGENTS.md` as the stable product brief;
- keep this roadmap current when priorities change;
- ensure new work is reviewed against the product principles before implementation.

Acceptance:
- a new contributor can understand the product quickly;
- future decisions can be checked against explicit principles instead of oral context only.

## Agent Split

### Agent A - Content and editorial trust

Owns:
- encoding cleanup;
- French and English microcopy;
- practical tone review;
- content prioritization.

Expected outputs:
- corrected labels and core copy;
- editorial consistency notes;
- improved CTA and system messages.

### Agent B - Dynamic state reliability

Owns:
- route loading behavior;
- detail-page states;
- reusable loading/error/empty patterns;
- final technical verification.

Expected outputs:
- state-management fixes;
- clearer UI states;
- build and lint confirmation.

### Agent C - CMS and data alignment

Owns:
- `.pages.yml` review;
- loader/front mapping;
- rich-text strategy;
- cleanup of unused editorial fields.

Expected outputs:
- field-to-render inventory;
- schema simplification or field wiring;
- safer editing model.

### Agent D - UX structure and navigation

Owns:
- home-page journeys;
- navigation clarity;
- hierarchy of practical information;
- CTA prioritization.

Expected outputs:
- revised home information architecture;
- clearer audience entry points;
- mobile-first flow improvements.

### Agent E - Practical domain pages

Owns:
- parking usefulness;
- events usefulness;
- walks usefulness;
- practical-information section design.

Expected outputs:
- richer structured fields and screens;
- more decision-oriented page content;
- list of missing municipal source data to collect.

## Suggested Multi-Agent Sequence

### Sprint 1

- Agent A: fix encoding and critical copy.
- Agent B: fix false error states and loading behavior.
- Agent C: audit CMS/data/frontend alignment.

Goal:
- restore product trust and technical reliability.

### Sprint 2

- Agent C: wire or remove misleading CMS fields.
- Agent D: rework home-page journeys and prioritization.
- Agent E: design the practical-information layer.

Goal:
- make the product easier to understand and easier to edit.

### Sprint 3

- Agent E: enrich parking, events, and walks.
- Agent D: refine page-level UX and mobile prioritization.
- Agent C: improve editor workflow where possible.

Goal:
- move from acceptable product to strong field utility.

## Definition Of Done For This Program

The program is effectively complete when:
- the site no longer shows visible language or encoding defects;
- dynamic pages behave reliably on first load and slow networks;
- municipal editors can trust the CMS structure;
- practical information is easy to find for visitors and residents;
- home and navigation clearly serve distinct user needs;
- parking, events, and walk pages help users act, not just read.
