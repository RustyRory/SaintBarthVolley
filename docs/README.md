# Documentation – Projet Numérique du Club de Volley de Saint-Barthélemy-d'Anjou

Ce dossier `docs/` regroupe l'ensemble des documents de **conception, organisation et développement** du projet numérique du club de volley de Saint-Barthélemy-d'Anjou.

---

## Vue d'ensemble

| Élément | Valeur |
|---|---|
| Type | Site vitrine + back-office admin |
| Architecture | MERN (MongoDB, Express, Next.js, Node.js) |
| Déploiement | VPS + Docker + Nginx |
| Public cible | Visiteurs, adhérents, administrateurs du club |
| Objectif | Structurer et professionnaliser la présence numérique du club |

---

## Structure du dossier `docs/`

```
docs/
├── README.md                          ← Ce fichier (sommaire)
├── cahier-des-charges/
│   └── cahier-des-charges.md
├── workflow/
│   └── workflow.md
├── uml/
│   ├── utilisation.md
│   ├── classes.md
│   ├── sequence.md
│   ├── activite.md
│   └── images/
├── cartographies/
│   ├── fonctionnelle.md
│   ├── technique.md
│   ├── deploiement.md
│   └── images/
├── data-conception/
│   ├── data.md
│   ├── mcd.md
│   ├── mld.md
│   └── mpd.md
└── projet/
    ├── backend/
    │   ├── backend.md
    │   ├── auth.md
    │   ├── scraping.md
    │   └── images/
    └── frontend/
        ├── frontend.md
        ├── pages.md
        ├── login.md
        ├── dashboard.md
        └── vitrine.md
```

---

## 1. Cahier des charges

[docs/cahier-des-charges/cahier-des-charges.md](./cahier-des-charges/cahier-des-charges.md)

Contexte du club, objectifs fonctionnels, périmètre, contraintes techniques, critères de validation.

---

## 2. Workflow & CI/CD

[docs/workflow/workflow.md](./workflow/workflow.md)

- Convention de branches et commits (Conventional Commits)
- Règles de protection GitHub (Rulesets)
- Pipelines GitHub Actions (lint, build, audit, deploy)
- Règles pre-commit (Husky + lint-staged)

---

## 3. UML – Modélisation applicative

[docs/uml/](./uml/)

| Document | Contenu |
|---|---|
| [utilisation.md](./uml/utilisation.md) | Cas d'utilisation par acteur (Visiteur, Admin, Système) |
| [classes.md](./uml/classes.md) | Diagramme de classes complet |
| [sequence.md](./uml/sequence.md) | Diagrammes de séquence (auth, scraping, CRUD) |
| [activite.md](./uml/activite.md) | Diagrammes d'activité (connexion, publication, saison) |

---

## 4. Cartographies

[docs/cartographies/](./cartographies/)

| Document | Contenu |
|---|---|
| [fonctionnelle.md](./cartographies/fonctionnelle.md) | Vue métier — domaines et acteurs |
| [technique.md](./cartographies/technique.md) | Vue logicielle — stack et couches |
| [deploiement.md](./cartographies/deploiement.md) | Vue infrastructure — VPS, Docker, Nginx |

---

## 5. Conception des données

[docs/data-conception/](./data-conception/)

| Document | Contenu |
|---|---|
| [data.md](./data-conception/data.md) | Dictionnaire de données (toutes les collections) |
| [mcd.md](./data-conception/mcd.md) | Modèle Conceptuel de Données (MERISE) |
| [mld.md](./data-conception/mld.md) | Modèle Logique de Données (MERISE) |
| [mpd.md](./data-conception/mpd.md) | Modèle Physique — schémas MongoDB (JSON) + SQL équivalent |

---

## 6. Backend

[docs/projet/backend/](./projet/backend/)

| Document | Contenu |
|---|---|
| [backend.md](./projet/backend/backend.md) | Architecture, structure, API REST, CRUD |
| [auth.md](./projet/backend/auth.md) | Authentification JWT, rôles, routes sécurisées |
| [scraping.md](./projet/backend/scraping.md) | Scraping FFVB, Puppeteer, Cheerio, upsert MongoDB |

---

## 7. Frontend

[docs/projet/frontend/](./projet/frontend/)

| Document | Contenu |
|---|---|
| [frontend.md](./projet/frontend/frontend.md) | Architecture Next.js, helper API, structure |
| [pages.md](./projet/frontend/pages.md) | Arborescence App Router, pages publiques et protégées |
| [login.md](./projet/frontend/login.md) | Flow auth, cookie httpOnly, middleware de protection |
| [dashboard.md](./projet/frontend/dashboard.md) | Back-office admin, gestion utilisateurs et contenus |
| [vitrine.md](./projet/frontend/vitrine.md) | Pages publiques, SEO, formulaire contact |
