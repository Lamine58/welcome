# Portfolio Appartement — Lamine Ishola

Portfolio **Nuxt 3** + **Three.js** : vous êtes dans un appartement 3D. **Cliquez sur une porte** pour l’ouvrir et découvrir les informations (profil, projets, compétences, parcours, contact).

## Lancer

```bash
cd portfolio-3d
npm install
npm run dev
```

→ http://localhost:3001

## Contrôles

- **Clic + glisser** : regarder autour de la pièce
- **Survol d’une porte** : infobulle
- **Clic sur une porte** : ouverture animée + panneau d’informations
- **Fermer le panneau** : la porte se referme

## Portes

| Porte | Contenu |
|-------|---------|
| Qui suis-je ? | Profil & bio |
| Mes projets | XPAYE, SETBC, SISRAH… |
| Compétences | Stack technique |
| Parcours | Expériences pro |
| Contact | Email, LinkedIn, GitHub |

Données : `composables/usePortfolioData.ts`
