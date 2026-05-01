# Product Vision

## Purpose
- This app is the practical digital front door for Fontaine-de-Vaucluse.
- It must help tourists, day visitors, and residents find reliable local information quickly.
- It must stay easy to edit for municipal elected officials working through the CMS.

## Primary Audiences
- Day visitors: where to park, what to do now, how to move around, what to check before arriving.
- Tourists staying longer: events, walks, photos, practical guidance, local conditions.
- Residents: local updates, municipal information, useful practical contacts.
- Municipal editors: publish and update content without technical friction.

## Product Principles
- Utility before decoration. Practical information comes first.
- Mobile first. The app must work well outdoors, on the move, and on weak networks.
- Clear navigation. Labels must be obvious and stable across the site.
- Trust matters. Dates, locations, access information, and alerts must feel official and current.
- One page, one main job. Each screen should support a concrete user intention.

## UX Principles
- Prioritize the information a user needs right now: parking, access, alerts, opening conditions, contacts.
- Reduce decision effort. Do not force users to infer what to do next.
- Keep interfaces readable and calm on mobile.
- Always provide explicit `loading`, `empty`, `error`, and `not found` states for dynamic content.
- Accessibility is part of the baseline, not a later improvement.

## Editorial Principles
- Tone: friendly, direct, reassuring, concrete.
- Avoid administrative jargon and generic tourism language.
- Write for action: what to do, where to go, when to come, who to contact.
- Prefer short sentences, short blocks, and useful lists.
- Critical practical information should show a clear last-update signal when relevant.

## CMS Principles
- Every editable field must have a visible and predictable effect on the public site.
- Do not keep unused, duplicate, or confusing CMS fields.
- Rich text is acceptable only if the frontend renders it properly.
- CMS labels and field structures must be understandable by non-technical editors.
- Simpler schemas are better than flexible schemas that editors cannot trust.

## Quality Bar For Future Changes
- A change should improve clarity, reliability, access speed, or editorial maintainability.
- Practical municipal information must never be buried behind decorative content.
- New features must serve a real need for a visitor, resident, or editor.
- The site must remain robust on mobile and understandable without prior knowledge of the village.
- French content quality is part of product quality.

## Current Strategic Priorities
- Fix text encoding and content quality issues.
- Make loading and error behavior reliable.
- Align CMS fields with actual frontend rendering.
- Build a stronger practical-information layer for both visitors and residents.
- Clarify entry journeys such as `Je visite aujourd'hui`, `Je prepare ma venue`, and `Je suis habitant`.

## Avoid
- Generic promotional copy with no immediate user value.
- Hidden or ambiguous navigation.
- CMS fields that do not affect the public UI.
- Rich content that collapses into unreadable plain text.
- Regressions in mobile usability, accessibility, or editorial trust.
- Assumptions that users already know the village layout or municipal context.
