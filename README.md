# Fontaine Info à la Source

Application statique JAMstack pour la commune de Fontaine-de-Vaucluse. Le site est pensé pour informer rapidement les visiteurs pendant les périodes de forte fréquentation estivale, avec un maximum d'outils gratuits.

## Stack

- `Vite` + `React` pour le frontend statique
- `Tailwind CSS` pour les styles utilitaires
- `Netlify` pour le déploiement
- `Pages CMS` via `.pages.yml` pour l'édition des contenus JSON et l'upload d'images
- `OpenStreetMap` + `Leaflet` pour les cartes sans dépendance propriétaire

## Contenus gérés

- `public/content/news/news.json` : actualités
- `public/content/events/events.json` : événements
- `public/content/hikes/hikes.json` : randonnées
- `public/content/parkings/parkings.json` : parkings
- `public/uploads/` : médias uploadés via le CMS

Les événements peuvent aussi définir une récurrence optionnelle via un bloc `recurrence` :

```json
{
  "frequency": "weekly",
  "interval": 1,
  "until": "2026-10-31",
  "weekdays": ["wednesday", "friday"]
}
```

Valeurs supportées pour `frequency` : `daily`, `weekly`, `monthly`, `weekdays`.

## Commandes

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Déploiement Netlify

- Build command : `npm run build`
- Publish directory : `dist`
- Le fichier `public/_redirects` gère les routes du SPA côté hébergement

## Notes

- Les données présentes dans `public/content/` servent de base éditoriale et peuvent être remplacées par les contenus réels de la commune.
- Les cartes utilisent uniquement des services gratuits compatibles avec une architecture statique.
