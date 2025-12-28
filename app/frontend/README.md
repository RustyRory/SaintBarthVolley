# Frontend – Site officiel du club de volley de Saint-Barthélemy-d’Anjou

## 🎯 Objectif

Cette application front-end est la partie **publique et administrative (back-office)** du site web du club de volley de Saint-Barthélemy-d’Anjou.

Elle permet :

- La consultation des contenus publics (équipes, actualités, résultats, partenaires…)
- La gestion des contenus via une interface d’administration sécurisée
- Une navigation fluide et responsive (desktop & mobile)

---

## 🧱 Stack technique

- **React** (SPA)
- **TypeScript** (si activé)
- **Vite** (build & dev server)
- **React Router** (navigation)
- **Axios / Fetch** (API)
- **ESLint** (qualité du code)
- **Prettier** (formatage)
- **CSS / Tailwind / SCSS** (selon implémentation)

---

## 📁 Structure des dossiers

```
frontend/
├── src/
│ ├── assets/ # Images, icônes, visuels
│ ├── components/ # Composants UI réutilisables
│ ├── pages/ # Pages (Home, Teams, News, Admin…)
│ ├── layouts/ # Layouts globaux (Public / Admin)
│ ├── services/ # Appels API
│ ├── hooks/ # Hooks personnalisés
│ ├── context/ # Context API / Auth
│ ├── styles/ # Styles globaux
│ ├── utils/ # Helpers
│ └── main.tsx
├── public/
├── .eslintrc
├── .prettierrc
├── package.json
└── vite.config.ts
```

---

## 🚀 Lancer le projet

### Installation des dépendances

```bash
npm install
```

Démarrage en mode développement

```bash
npm run dev
```

Build de production

```bash
npm run build
```

### 🔐 Authentification & rôles

- Authentification via JWT (API backend)
- Rôles :
  - admin
  - editor
- Accès restreint au back-office selon les droits

### 🎨 UX / UI

Les maquettes de référence sont disponibles dans :

```bash
docs/maquettes/
```

⚠️ Toute évolution UI doit respecter :

- La charte graphique existants
- Les maquettes validées
- L’accessibilité (contrastes, lisibilité)

### 🧹 Qualité de code

Ce projet est soumis à :

- ESLint
- Prettier
- pre-commit hooks

Les linters sont exécutés :

- Avant chaque commit
- Lors des pipelines CI

### 🔗 Liens utiles

- 📐 Maquettes : docs/maquettes/
- 📄 Cahier des charges : docs/cahier-des-charges/
- 🗺️ Cartographie : docs/cartographies/
- 🔁 Workflow Git : docs/workflow/

### 🧠 Bonnes pratiques

- Composants petits et réutilisables
- Pas de logique métier dans les composants UI
- Appels API centralisés
- Pas de données mockées en dur en production

### 👥 Contribution

Merci de lire CONTRIBUTING.md avant toute contribution.
