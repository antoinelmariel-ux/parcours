# HDJ Pathway Mapper

Prototype React/TypeScript offline-first pour modéliser les parcours patients d'hôpital de jour.

## Structure

Le dossier [`hdj-pathway-mapper`](hdj-pathway-mapper) contient l'application Vite ainsi que :

- PWA (manifest + service worker) utilisable offline.
- Canvas Flow avec création de blocs, déplacement et connexion (Alt+clic pour amorcer un lien, clic pour terminer).
- Sidebar bibliothèque (drag & drop), panneau propriété, timeline placeholder.
- Stockage IndexedDB via Dexie, import/export de fichiers `.hdjpm.json`, export PNG.
- Trois templates par défaut (ORL, immuno, perfusion courte).
- Tests unitaires Vitest + test Playwright de fumée.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run test
npm run test:e2e
```

> Les tests E2E nécessitent Playwright (`npx playwright install`).
