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

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
