# Déployer sur https://lamine58.github.io/welcome/

## Erreur `deploy-pages@v4` → 404 Not Found

Cette erreur **ne vient pas du code Nuxt**. GitHub refuse le déploiement parce que **Pages n’est pas configuré avec « GitHub Actions »**.

Ce projet utilise la branche **`gh-pages`** (plus simple).

---

## Configuration GitHub (à faire une fois)

1. Ouvre : https://github.com/Lamine58/welcome/settings/pages  
2. Section **Build and deployment**  
3. **Source** : choisis **`Deploy from a branch`**  
   - ❌ pas « GitHub Actions » (sinon `deploy-pages` échoue en 404)  
4. **Branch** : `gh-pages`  
5. **Folder** : `/ (root)`  
6. Clique **Save**

Attends 2–10 minutes, puis ouvre : https://lamine58.github.io/welcome/

---

## Déploiement automatique

À chaque push sur `main`, l’action **Deploy Nuxt to GitHub Pages** :

1. `npm run generate:gh` (chemins `/welcome/…`)
2. pousse le résultat sur la branche `gh-pages`

---

## Si tu veux l’ancienne méthode `deploy-pages` (autre repo)

Sur **cet** repo, il faudrait :

- **Source** = **GitHub Actions** dans Settings → Pages  
- Workflow avec `upload-pages-artifact` + `deploy-pages@v4`

Ne mélange pas les deux sources sur le même repo.
