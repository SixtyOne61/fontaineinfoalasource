# Practical Information Editorial Notes

This note explains how to use the new `dailyInfo` and `practicalServices` blocks in `public/content/site/site.json` and `.pages.yml`.

## Goal

- `dailyInfo` is for short, current, high-priority information.
- `practicalServices` is for stable practical help such as toilets, water, accessibility, visitor reception, or useful on-site services.
- `contacts` stays focused on official or first-level contacts.

## When to use `dailyInfo`

- Use it for information that can change the way someone organises the day.
- Good examples: busy parking periods, temporary access advice, heat precautions, event-day circulation notes.
- Keep the title short and the summary concrete.
- Always fill `updatedAt` when the information changes.
- Fill `validUntil` when the information should expire after a known date.
- Set `published` to `false` if the item is only being drafted or still needs validation.

## When to use `practicalServices`

- Use it for useful services that people may actively look for.
- Good examples: tourist office, public toilets, water points, accessibility guidance, shaded resting spots, visitor reception.
- Only publish entries that are verified enough to be trusted.
- If a service is seasonal or uncertain, fill `updatedAt` and keep `published` to `false` until confirmed.

## Editorial rules for elected editors

- Prefer short sentences and direct wording.
- Write what people need to do, not internal process language.
- Avoid vague labels such as `Important` with no practical explanation.
- If an item is not verified, do not publish it.
- If the information is time-sensitive, add the date in the content and keep `updatedAt` current.

## Suggested routine

1. Check if the information changes the visitor's or resident's immediate decision.
2. If yes and it is temporary, use `dailyInfo`.
3. If it is a stable service, use `practicalServices`.
4. If it is an official contact, use `contacts`.
5. Before publishing, verify the wording, the date, and the concrete action expected from the user.
