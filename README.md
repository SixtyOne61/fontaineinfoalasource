# Fontaine Info a la Source

Application statique JAMstack pour la commune de Fontaine-de-Vaucluse.

Le site est pense pour informer rapidement les visiteurs et habitants, en particulier pendant les periodes de forte frequentation, avec un maximum d'outils simples et gratuits.

## Vision et pilotage

- Vision produit durable pour les futurs runs Codex: [AGENTS.md](./AGENTS.md)
- Plan d'action priorise: [docs/action-plan.md](./docs/action-plan.md)

## Stack

- `Vite` + `React` pour le frontend statique
- `Tailwind CSS` pour les styles utilitaires
- `Netlify` pour le deploiement
- `Pages CMS` via `.pages.yml` pour l'edition des contenus JSON et l'upload d'images
- `OpenStreetMap` + `Leaflet` pour les cartes sans dependance proprietaire

## Contenus geres

- `public/content/news/news.json` : actualites
- `public/content/events/events.json` : evenements
- `public/content/hikes/hikes.json` : randonnees
- `public/content/parkings/parkings.json` : parkings
- `public/content/photos/photos.json` : groupes photo
- `public/content/site/site.json` : contenus transverses
- `public/content/site/sections.json` : visibilite des sections
- `public/uploads/` : medias uploades via le CMS

Les evenements peuvent aussi definir une recurrence optionnelle via un bloc `recurrence` :

```json
{
  "frequency": "weekly",
  "interval": 1,
  "until": "2026-10-31",
  "weekdays": ["wednesday", "friday"]
}
```

Valeurs supportees pour `frequency` : `daily`, `weekly`, `monthly`, `weekdays`.

## Commandes

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Deploiement Netlify

- Build command : `npm run build`
- Publish directory : `dist`
- Le fichier `public/_redirects` gere les routes SPA cote hebergement

## Notes

- Les donnees presentes dans `public/content/` servent de base editoriale et peuvent etre remplacees par les contenus reels de la commune.
- Les cartes utilisent uniquement des services gratuits compatibles avec une architecture statique.
