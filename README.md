# 🏐 Saint Barth Volley — Plateforme Web

Site web et plateforme numérique du **Club de Volley de Saint-Barthélemy-d’Anjou (49)**.  
Le projet vise à **structurer, moderniser et professionnaliser** la communication et la gestion des informations du club.

---

## 🎯 Objectifs du projet

- Créer un **site web vitrine moderne et responsive**
- Centraliser les informations du club (équipes, saisons, matchs, actualités)
- Automatiser l’affichage des **résultats et classements FFVB**
- Mettre en valeur les partenaires et les événements
- Fournir un **back-office simple** pour les bénévoles
- Poser une base technique solide et maintenable (architecture MERN)

---

## 🧱 Stack technique

### Frontend
- **React**
- Vite
- ESLint / Prettier
- Responsive design (mobile-first)

### Backend
- **Node.js / Express**
- API REST interne
- Authentification sécurisée (JWT)
- Cron jobs (scraping FFVB, tâches planifiées)

### Base de données
- **MongoDB**
- Mongoose (ODM)
- Historisation des données par saison

### Dev & Qualité
- **Pre-commit** (lint + format automatique)
- GitHub Actions (CI/CD, releases)
- Conventional Commits
- SemVer

---

## 📂 Structure du projet

```
├── app/
│ ├── frontend/ # Application React
│ └── backend/ # API Express
│
├── docs/ # Documentation de conception
│
├── .github/
│ └── workflows/ # GitHub Actions
│
├── INSTALL.md # Installation et setup du projet
├── CONTRIBUTING.md # Guide de contribution
├── CHANGELOG.md # Historique des versions
├── README.md # (ce fichier)
└── .pre-commit-config.yaml
```

---

## 📚 Documentation du projet

Toute la **conception fonctionnelle et technique** est centralisée dans le dossier `docs/`.

👉 **Point d’entrée recommandé** :
- 📖 [`docs/README.md`](docs/README.md)

### Contenu du dossier `docs/`

| Document | Description |
|--------|-------------|
| 📄 Cahier des charges | Vision, objectifs, périmètre fonctionnel |
| 🔄 Workflow | Git, branches, releases, CI/CD |
| 🧩 UML | Diagrammes (cas d’usage, séquences, classes) |
| 🗺️ Cartographies | Architecture applicative et flux |
| 🎨 Maquettes | UX/UI (desktop & mobile) |
| 🗄️ Conception des données | Dictionnaire, MCD, MLD, MPD |

---

## 🚀 Installation & démarrage

**Voir le guide** :  
[`INSTALL.md`](/INSTALL.md)

Résumé rapide :

```bash
# Frontend
cd app/frontend
npm install
npm run dev

# Backend
cd app/backend
npm install
npm run dev
```

## 🧪 Qualité & linting

Le projet utilise pre-commit pour garantir la qualité du code :
- ESLint (frontend & backend)
- Prettier
- Lancement automatique avant chaque git commit
  
```
pre-commit install
```

## 🔁 Workflow Git

Branches : main, develop, feature/*, release/*, hotfix/*

Commits normalisés (Conventional Commits)

Releases automatiques via GitHub Actions

📘 Détails :
[`workflow.md`](docs/workflow/workflow.md)

## 🤝 Contribuer

Les contributions sont les bienvenues, même ponctuelles 🙌

📌 Merci de lire avant toute contribution :
[`CONTRIBUTING.md`](/CONTRIBUTING.md)

## 📈 Suivi & évolutions

- Roadmap basée sur les saisons sportives
- Architecture pensée pour évoluer (PWA, extranet adhérents, statistiques avancées)

## 🛡️ Sécurité & conformité

- HTTPS
- RGPD (données minimales, consentement)
- Sauvegardes planifiées
- Séparation claire Front / API / DB

## 📄 Licence

Projet développé bénévolement pour une association sportive.
Licence à définir (MIT recommandée).

## ❤️ Remerciements

Projet porté par une équipe bénévole du club.