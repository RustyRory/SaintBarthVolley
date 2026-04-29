# Rapport de projet — MyDigitalSchool

## Contexte

### MyDigitalSchool

Je suis actuellement étudiant en Bachelor Développeur Web et Mobile à MyDigitalSchool.

Ce document constitue mon rapport annuel et présente les différents projets réalisés au cours de ma formation.

L'objectif de ce dossier est de démontrer l'acquisition des compétences nécessaires à l'obtention du titre de Concepteur Développeur d'Applications (CDA).

### Titre CDA

Pour obtenir le titre CDA, plusieurs éléments doivent être préparés :

- Un dossier professionnel (avec accompagnement des intervenants)
- Un dossier de projets (présent document)

Ce dossier permet de valider les compétences suivantes :

**Développer une application sécurisée**

- Installer et configurer son environnement de travail en fonction du projet
- Développer des interfaces utilisateur
- Développer des composants métier
- Contribuer à la gestion d'un projet informatique

**Concevoir et développer une application sécurisée en architecture multicouche**

- Analyser les besoins et concevoir une maquette
- Définir l'architecture logicielle
- Concevoir et mettre en place une base de données relationnelle
- Développer des composants d'accès aux données SQL et NoSQL

**Préparer le déploiement d'une application sécurisée**

- Préparer et exécuter des plans de tests
- Documenter le déploiement de l'application
- Participer à la mise en production dans une démarche DevOps

### Modalités d'évaluation

L'évaluation se déroule en plusieurs étapes :

**Questionnaire professionnel**

Date : 24 juin (matin) — Durée : 30 minutes

- Étude d'une documentation technique en anglais
- Réponses à 2 questions fermées (en français) et 2 questions ouvertes (en anglais)

**Présentation orale devant un jury**

- **Présentation du projet (40 minutes)** — Le candidat réalise un ou plusieurs projets en amont, prépare un dossier et un diaporama. Le jury prend connaissance du dossier avant la présentation (30 minutes).
- **Entretien technique (45 minutes)** — Le jury évalue les compétences à partir du dossier et de la présentation, avec des questions complémentaires.
- **Entretien final (20 minutes)** — Échange sur la posture professionnelle et la vision globale du candidat.

---

## 1. Projet associatif — AS Saint-Barthélemy Volley

### 1.1 Contexte

Dans le cadre de mon année de formation, j'ai participé à la conception et au développement d'un site web pour le club sportif de Volley-ball situé à Saint-Barthélemy-d'Anjou (49).

Cette association regroupe plusieurs équipes (jeunes, séniors et loisirs) et évolue à différents niveaux de compétition, notamment en Nationale 3 et en Régional. Malgré son activité et son développement, le club ne dispose pas de site web officiel, limitant sa visibilité à ses réseaux sociaux.

Cette situation entraîne plusieurs problématiques :

- Absence de centralisation des informations
- Communication peu structurée
- Manque de visibilité auprès du grand public et des partenaires
- Difficulté d'accès aux informations pour les adhérents

### 1.2 Objectifs du projet

- Créer une plateforme centralisée pour les informations du club
- Valoriser les équipes, les événements et les partenaires
- Améliorer l'accessibilité des informations pour les utilisateurs
- Mettre en place un outil de gestion de contenu simple via un back-office
- Préparer une base technique évolutive pour les besoins futurs

### 1.3 Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Front-end | Next.js (React) + TypeScript | Next.js 16 / React 19 |
| UI | Tailwind CSS + Shadcn/ui + Radix UI | Tailwind v4 |
| Back-end | Node.js + Express | Express 5.2 / Node 20 |
| Base de données | MongoDB + Mongoose | MongoDB 7 / Mongoose 9 |
| Scraping | Puppeteer + Cheerio | Puppeteer 24 |
| Auth | JWT (httpOnly cookie) + bcrypt | — |
| Email | Nodemailer (SMTP) | — |
| Upload | Multer | — |
| Déploiement | Docker + Docker Compose + Nginx | — |
| CI/CD | GitHub Actions | — |

---

## 2. Cahier des charges

### 2.1 Analyse des besoins

Besoins fonctionnels identifiés à partir des échanges avec les responsables du club :

- Disposer d'un site web vitrine moderne et accessible
- Centraliser les informations du club (équipes, horaires, événements)
- Valoriser les résultats sportifs et les partenaires
- Faciliter la communication avec les adhérents et le public
- Permettre une gestion autonome du contenu via un back-office

### 2.2 Fonctionnalités principales

**Partie publique (visiteur)**

- Consultation des informations générales du club
- Navigation entre les équipes et leurs compositions
- Fiches joueurs et staff
- Actualités et articles
- Galeries photos par album
- Partenaires et sponsors
- Archives par saison
- Formulaire de contact

**Partie administration (back-office)**

- Gestion des équipes et des joueurs
- Gestion des saisons (création, archivage, duplication)
- Publication et gestion des actualités
- Gestion des médias (albums, photos)
- Gestion des partenaires
- Supervision des utilisateurs et de leurs rôles
- Déclenchement manuel du scraping FFVB

**Automatisations**

- Récupération automatique des résultats via la FFVB (Puppeteer)
- Mise à jour des classements
- Historisation des données par saison
- Gestion des erreurs et logs en temps réel

### 2.3 Modélisation UML

- Diagrammes de cas d'utilisation (acteurs et interactions)
- Diagrammes de classes (modélisation des données)
- Diagrammes d'activités et de séquence (flux fonctionnels)

### 2.4 Cartographies

- **Cartographie fonctionnelle** — Organisation des fonctionnalités par module
- **Cartographie technique** — Architecture des composants et interactions entre les couches

### 2.5 Conception UX

Des maquettes ont été produites pour définir l'ergonomie générale du site, structurer la navigation et garantir la cohérence visuelle avec la charte graphique du club.

---

## 3. Organisation de développement

### 3.1 Gestion du code source — Git & GitHub

| Branche | Rôle |
|---|---|
| `feature/*` / `feat/*` | Développement de nouvelles fonctionnalités |
| `fix/*` | Correction de bugs |
| `hotfix/*` | Corrections urgentes en production |
| `release/*` | Préparation des versions |
| `dev` | Intégration des fonctionnalités |
| `staging` | Version testable (pré-production) |
| `main` | Version stable (production) |

Cycle de développement :

```
feature/* → dev → release/* → main
hotfix/* → main
```

### 3.2 Protection des branches

Un système de règles GitHub Rulesets protège les branches critiques :

- Push directs interdits sur `main`, `staging` et `dev`
- Pull Requests obligatoires
- Validations requises avant intégration
- Suppressions et modifications forcées bloquées

Ces règles ont été allégées en contexte solo pour ne pas ralentir le développement, mais sont prévues pour un contexte d'équipe.

### 3.3 Intégration continue (CI) — GitHub Actions

Les workflows CI se trouvent dans `.github/workflows/` :

| Workflow | Déclencheur | Description |
|---|---|---|
| `lint.yml` | PR / push | ESLint backend (.js) et frontend (.ts, .tsx) + Prettier |
| `tests.yml` | PR / push `main`, `dev` | Tests backend (MongoDB service) + build frontend |
| `audit.yml` | Planifié | `npm audit` — audit des dépendances |
| `commit-message.yml` | PR | Validation du format des messages de commit |
| `branch-name.yml` | PR | Validation du nom de branche |
| `ticket.yml` | PR | Vérification de la présence d'une issue liée |
| `structure.yml` | PR | Vérification des fichiers essentiels du projet |
| `labels.yml` | PR | Gestion automatique des labels |
| `hotfix.yml` | Push `hotfix/*` | Workflow de correction urgente |
| `release.yml` | Push `release/*` | Génération du tag SemVer et création de release GitHub |
| `deploy.yml` | Push `main` | Déploiement automatisé sur le VPS |

### 3.4 Hooks Git (pre-commit)

Un système de hooks via `.pre-commit-config.yaml` exécute automatiquement avant chaque commit :

- Linting du code (ESLint)
- Vérification du formatage (Prettier)
- Validation du format des fichiers

Si une erreur est détectée, le commit est bloqué.

### 3.5 Déploiement continu (CD)

Le workflow `deploy.yml` automatise la mise en production au push sur `main` :

1. Connexion SSH au VPS
2. Mise à jour du dépôt (`git pull`)
3. Build des images Docker `sbv-api` et `sbv-front`
4. Redémarrage des conteneurs via `docker-compose`

Le workflow `release.yml` gère le versioning :

- Création automatique d'un tag Git (SemVer)
- Génération d'une release GitHub
- Mise à jour du `CHANGELOG.md`

### 3.6 Versioning — SemVer

```
MAJOR.MINOR.PATCH
```

| Type | Incrément |
|---|---|
| Changements incompatibles | MAJOR |
| Ajout de fonctionnalités | MINOR |
| Corrections de bugs | PATCH |

Un fichier `CHANGELOG.md` est maintenu selon la convention *Keep a Changelog*.

---

## 4. Conception de la base de données

### 4.1 Démarche méthodologique (MERISE)

1. Dictionnaire de données
2. Modélisation conceptuelle (MCD)
3. Modèle logique des données (MLD)
4. Modèle physique des données (MPD)

### 4.2 Choix technologique — MongoDB

**MongoDB** (NoSQL orienté document) a été retenu pour :

- La flexibilité des schémas (données sportives hétérogènes)
- La rapidité de développement
- L'adéquation avec JavaScript / JSON

Une modélisation relationnelle SQL a également été réalisée pour structurer les données avec rigueur et anticiper une éventuelle migration.

| Critère | MongoDB | SQL |
|---|---|---|
| Structure | Flexible (documents) | Structurée (tables) |
| Relations | Références / embedding | Clés étrangères |
| Performance | Rapide en développement | Optimisée en production |
| Évolutivité | Forte (schéma flexible) | Plus rigide |
| Intégrité données | Faible | Forte (contraintes SQL) |

### 4.3 Modèles Mongoose (collections)

| Modèle | Description | Champs clés |
|---|---|---|
| **User** | Comptes administrateurs | email, passwordHash, role (admin/editor/writer/user), isVerified, isActive, resetToken |
| **Season** | Saisons sportives | name, startDate, endDate, status (active/archived/future) |
| **Team** | Équipes du club | name, category (Young/Senior/Veteran), gender, level, seasonId, trainingSchedule[], photo, federationUrl |
| **Member** | Joueurs et staff | firstName, lastName, birthDate, height, weight, bio, isActive, teamRoles[] |
| **Match** | Résultats de matchs | teamId, opponentName, date, address, homeAway, status, scoreFor, scoreAgainst, setsDetail[] |
| **Standing** | Classements | teamId, rank, points, played, wins, losses, setsFor, setsAgainst |
| **News** | Articles | title, slug, content, albumId, authorId, isPublished, isFeatured, publishedAt |
| **Club** | Infos du club | name, subtitle, descriptions, logo, photo, email, phone, address, socialLinks, legalInfo |
| **Album** | Albums photos | title, description, eventDate, isPublic |
| **Media** | Fichiers (photos/vidéos) | albumId, url, type (photo/video) |
| **Partner** | Partenaires/sponsors | name, description, logo, website, priority, isActive |

### 4.4 Relations principales (MCD simplifié)

```
CLUB (1,1) ——— (0,n) EQUIPE
SAISON (1,1) ——— (0,n) EQUIPE
EQUIPE (0,n) ——— (0,n) MEMBRE  [via teamRoles[]]
UTILISATEUR (1,1) ——— (0,n) ACTUALITE
ACTUALITE (0,1) ——— (0,1) ALBUM
ALBUM (1,1) ——— (1,n) MEDIA
EQUIPE (1,1) ——— (0,n) MATCH
EQUIPE (1,1) ——— (0,1) CLASSEMENT
```

### 4.5 MLD (modèle logique)

```
UTILISATEUR(id, email, password, role, firstName, lastName, isVerified, isActive)
CLUB(id, name, subtitle, email, phone, address, logo)
SAISON(id, name, startDate, endDate, status)
EQUIPE(id, name, category, gender, level, season_id, club_id, federationUrl)
MEMBRE(id, firstName, lastName, type, isActive)
TEAM_MEMBRES(id, team_id, member_id, role, season_id)
ACTUALITE(id, title, slug, content, author_id, album_id, isPublished, isFeatured)
ALBUM(id, title, description, eventDate, isPublic)
MEDIA(id, album_id, url, type)
PARTENAIRE(id, name, website, logo, priority, isActive)
MATCH(id, team_id, opponentName, date, homeAway, status, scoreFor, scoreAgainst)
CLASSEMENT(id, team_id, rank, points, played, wins, losses)
```

---

## 5. Backend

### 5.1 Structure du projet

```
backend/
├── src/
│   ├── controllers/     # Logique métier (11 fichiers)
│   ├── models/          # Schémas Mongoose (11 modèles)
│   ├── routes/          # Définition des endpoints (15+ fichiers)
│   ├── middlewares/     # Auth + upload
│   ├── services/        # Service de scraping FFVB
│   ├── scripts/         # Seed admin, clear DB
│   ├── lib/             # Envoi d'emails (Nodemailer)
│   └── utils/           # Fonctions utilitaires
├── public/uploads/      # Stockage fichiers uploadés
├── server.js            # Point d'entrée
└── Dockerfile
```

### 5.2 Routes API

**Authentification — `/api/auth`**

| Endpoint | Méthode | Description | Auth |
|---|---|---|---|
| `/register` | POST | Inscription avec envoi d'email de vérification | Non |
| `/login` | POST | Connexion, renvoie JWT (cookie httpOnly, 7 jours) | Non |
| `/verify-email?token=` | GET | Vérification de l'adresse email | Non |
| `/logout` | POST | Déconnexion (suppression du cookie) | Non |
| `/me` | GET | Infos de l'utilisateur connecté | Oui |
| `/forgot-password` | POST | Demande de réinitialisation du mot de passe | Non |
| `/reset-password` | POST | Réinitialisation avec token | Non |

**Administration — `/api/admin`**

| Endpoint | Méthode | Description | Auth |
|---|---|---|---|
| `/users` | GET | Liste tous les utilisateurs | admin |
| `/users` | POST | Crée un utilisateur (bypass email) | admin |
| `/users/:id` | PATCH | Modifie un utilisateur | admin |
| `/users/:id/resend-verification` | POST | Renvoie l'email de vérification | admin |
| `/users/:id` | DELETE | Supprime un utilisateur | admin |

**Ressources métier**

| Route | Description |
|---|---|
| `/api/seasons` | CRUD saisons |
| `/api/teams` | CRUD équipes (avec planning d'entraînement) |
| `/api/members` | CRUD membres et gestion des rôles par saison |
| `/api/matches` | CRUD matchs (alimenté par le scraping) |
| `/api/standings` | CRUD classements |
| `/api/news` | CRUD actualités (draft/publish, featured) |
| `/api/clubs` | CRUD informations du club |
| `/api/albums` | CRUD albums photos |
| `/api/medias` | CRUD médias (photos/vidéos) |
| `/api/partners` | CRUD partenaires/sponsors |
| `/api/upload` | Upload de fichier (Multer, remplacement automatique) |
| `/api/scraping` | Déclenchement du scraping FFVB |
| `/api/stats` | Statistiques dashboard (users, membres, équipes, matchs…) |

### 5.3 Authentification JWT

**Flux d'inscription / activation**

```
1. POST /auth/register → compte créé (isActive = false, isVerified = false)
2. Email de vérification envoyé → GET /auth/verify-email?token=...
3. Admin active le compte → PATCH /admin/users/:id
4. Utilisateur peut se connecter → POST /auth/login → JWT (cookie httpOnly)
```

**Sécurité**

- Mot de passe hashé avec bcrypt (jamais exposé en réponse)
- JWT avec expiration 7 jours stocké en cookie httpOnly
- Middleware `authMiddleware` — vérifie JWT, bloque comptes inactifs
- Middleware `requireRole()` — protège les routes par rôle
- Validation de la force du mot de passe (8+ car., majuscule, minuscule, chiffre, spécial)
- Flow de réinitialisation du mot de passe par email

**Rôles**

| Rôle | Droits |
|---|---|
| `admin` | Accès complet |
| `editor` | Gestion des contenus |
| `writer` | Publication d'articles |
| `user` | Lecture seule |

**Seed admin**

```bash
node src/scripts/seedAdmin.js
```

Crée un compte admin actif si aucun admin n'existe, via `.env` :

```
ADMIN_EMAIL=admin@volley.com
ADMIN_PASSWORD=Admin123!
```

### 5.4 Scraping FFVB

**Problématique**

La page FFVB est rendue en PHP côté serveur. **Puppeteer** (contrôle d'un navigateur Chromium headless) est utilisé conjointement avec **Cheerio** (parsing HTML) pour en extraire les données.

**Pipeline**

```
1. Puppeteer ouvre l'URL FFVB (federationUrl de l'équipe)
2. Cheerio parse le HTML récupéré
3. Extraction des classements (standings) ligne par ligne
4. Extraction des matchs avec détection domicile/extérieur
5. Parsing des dates françaises et des scores set par set
6. Upsert en base (findOneAndUpdate + upsert: true)
7. Logs de progression envoyés en temps réel au dashboard admin
```

**Classement — Mapping HTML → Mongo**

| Index `<td>` | Contenu | Champ Mongo |
|---|---|---|
| 0 | Rang | `rank` |
| 1 | Nom équipe | `teamName` |
| 2 | Points | `points` |
| 3 | Matchs joués | `played` |
| 4 | Victoires | `wins` |
| 5 | Défaites | `losses` |
| 13 | Sets pour | `setsFor` |
| 14 | Sets contre | `setsAgainst` |

**Matchs — Logique domicile/extérieur**

- `td[3] === nom_équipe` → `homeAway: "home"`
- `td[5] === nom_équipe` → `homeAway: "away"`
- Scores présents → `status: "played"`, sinon `status: "scheduled"`

**Données racines requises**

Avant le premier scraping, créer manuellement :

```json
// Season
{ "name": "2025-2026", "status": "active" }

// Team
{ "name": "AS Saint-Barthélemy d'Anjou VB", "seasonId": "...", "federationUrl": "https://..." }
```

### 5.5 Upload de fichiers

- Endpoint : `POST /api/upload`
- Librairie : Multer
- Stockage : `/public/uploads/`
- Remplacement automatique de l'ancien fichier à la mise à jour
- Configuration Next.js Image pour autoriser les domaines externes

### 5.6 Emails (Nodemailer)

Utilisé pour :

- Vérification de l'adresse email à l'inscription
- Réinitialisation du mot de passe
- Renvoi de l'email de vérification par l'admin

Configuration via `.env` (compatible Ethereal Email pour le développement) :

```
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM="Saint-Barth Volley <no-reply@sbvb.fr>"
```

---

## 6. Frontend

### 6.1 Installation

```bash
npx create-next-app@latest frontend
cd frontend
npm run dev
```

Options : TypeScript, App Router, Tailwind CSS v4, ESLint, répertoire `src/`, alias d'import.

### 6.2 Structure du projet

```
src/
├── app/           → Pages (Next.js App Router)
│   ├── (public)/  → Pages publiques
│   ├── admin/     → Dashboard administrateur (protégé)
│   ├── login/
│   ├── register/
│   └── ...
├── components/
│   ├── ui/        → Composants Shadcn/ui (button, card, table, form…)
│   ├── auth/      → Formulaires login / register
│   └── dashboard/admin/ → Composants du back-office
├── lib/
│   ├── api.ts     → Helper fetch centralisé
│   └── auth.ts    → Client auth (login, register, logout, me, reset)
├── services/      → Appels API par ressource
├── hooks/         → Hooks personnalisés (ex: use-mobile.ts)
├── types/         → Types TypeScript (Season, Team, Member…)
└── utils/         → Utilitaires (permissions…)
```

### 6.3 Helper API centralisé

`src/lib/api.ts` — toutes les requêtes passent par cette fonction :

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erreur API");
  }

  return res.json();
}
```

### 6.4 Pages publiques

| Route | Description |
|---|---|
| `/` | Page d'accueil |
| `/login` | Formulaire de connexion |
| `/register` | Formulaire d'inscription |
| `/verify-email?token=` | Vérification d'adresse email |
| `/forgot-password` | Demande de réinitialisation |
| `/reset-password?token=` | Formulaire de nouveau mot de passe |

### 6.5 Dashboard administrateur

Le dashboard est protégé par `middleware.ts` qui redirige vers `/login` si aucun token n'est présent.

**Layout admin** (`/admin/layout.tsx`)

- Sidebar de navigation (Shadcn/ui Sidebar)
- Header avec logo et menu utilisateur
- Vérification du rôle admin au chargement

**Pages du back-office**

| Route | Description |
|---|---|
| `/admin` | Tableau de bord principal |
| `/admin/club` | Éditeur des informations du club |
| `/admin/seasons` | Gestion des saisons (liste, création, édition, suppression) |
| `/admin/seasons/[seasonId]/teams` | Équipes d'une saison |
| `/admin/seasons/[seasonId]/teams/[teamId]` | Détail et édition d'une équipe |
| `/admin/members` | Gestion des membres (joueurs et staff) |
| `/admin/news` | Gestion des actualités (draft/publish/featured) |
| `/admin/matches` | Visualisation des matchs (alimentés par le scraping) |
| `/admin/championships` | Configuration des championnats |
| `/admin/partners` | Gestion des partenaires et sponsors |
| `/admin/users` | Gestion des comptes utilisateurs et des rôles |

**Page d'accueil du dashboard (`/admin`)**

- Cartes de statistiques (utilisateurs, membres, équipes, matchs, actualités, partenaires)
- Bouton de déclenchement du scraping FFVB
- Logs du scraping en temps réel dans l'interface
- Liens rapides vers les pages de gestion

**Composants admin principaux**

| Composant | Rôle |
|---|---|
| `app-sidebar.tsx` | Menu de navigation latéral |
| `dashboard-header.tsx` | Barre supérieure (logo, utilisateur, déconnexion) |
| `section-admin-cards.tsx` | Cartes de statistiques |
| `season-form.tsx` | Formulaire CRUD saison |
| `team-form.tsx` | Formulaire CRUD équipe + planning |
| `members-form.tsx` | Formulaire CRUD membre + affectation |
| `club-form.tsx` | Formulaire infos du club (auto-save) |
| `users-form.tsx` | Formulaire CRUD utilisateurs + rôles |
| `file-upload.tsx` | Upload d'image avec aperçu |
| `image-upload.tsx` | Upload drag-and-drop |

### 6.6 Middleware de protection

`middleware.ts` — protège toutes les routes `/admin/*` :

- Vérifie la présence du token JWT
- Redirige vers `/login` si absent

---

## 7. Déploiement

### 7.1 Architecture

```
Internet
   ↓
Nginx (reverse proxy, HTTPS)
   ↓
Docker Compose
   ├── sbv-front  (Next.js, port 3000)
   ├── sbv-api    (Express, port 5000)
   └── MongoDB    (port 27017)
```

### 7.2 Dockerfiles

**Backend** (`backend/Dockerfile`)

- Image : Node 20 Alpine
- Installe uniquement les dépendances de production
- Crée le répertoire `/public/uploads`
- Expose le port 5000
- Entrée : `node server.js`

**Frontend** (`frontend/Dockerfile`)

- Build multi-étape :
  - Étape 1 (build) : Node 20 Alpine + `npm run build` (output standalone Next.js)
  - Étape 2 (runtime) : Node 20 Alpine, image allégée
- Arguments de build : `NEXT_BASE_PATH`, `NEXT_PUBLIC_API_URL`
- Expose le port 3000

### 7.3 Pipeline de déploiement (CD)

Le workflow `deploy.yml` se déclenche au push sur `main` :

```
1. Connexion SSH au VPS (secrets GitHub : VPS_HOST, VPS_USER, VPS_SSH_KEY)
2. git pull sur le VPS
3. docker-compose build sbv-api sbv-front
4. docker-compose up -d (redémarrage des conteneurs)
```

### 7.4 Sécurisation

- HTTPS via Nginx + Let's Encrypt
- Variables d'environnement isolées par service (`.env` non versionné)
- Séparation des accès utilisateur/services sur le VPS
- Sauvegardes régulières de la base MongoDB prévues

### 7.5 Variables d'environnement

**Backend (`.env`)**

```
MONGO_URI=mongodb://mongo:27017/saintbarthvolley
PORT=5000
FRONTEND_URL=http://YOUR_VPS_IP/saintbarth
CORS_ORIGIN=http://YOUR_VPS_IP
JWT_SECRET=CHANGE_ME_WITH_A_STRONG_SECRET
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM="Saint-Barth Volley <no-reply@sbvb.fr>"
ADMIN_EMAIL=admin@volley.com
ADMIN_PASSWORD=Admin123!
```

**Frontend**

Configuré via les arguments de build Docker :

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_BASE_PATH=/saintbarth
```

---

## 8. Tests

| Type | Outil | Statut |
|---|---|---|
| Tests unitaires backend | Jest | Non implémenté |
| Tests mocks API | Jest + Supertest | Non implémenté |
| Tests scraping | Jest (scripts) | Non implémenté |
| Tests E2E frontend | Playwright / Cypress | Non implémenté |

L'infrastructure de tests est configurée dans les workflows CI (`tests.yml`) avec les variables d'environnement nécessaires (`MONGO_URI`, `JWT_SECRET`). Les suites de tests sont à implémenter.

---

## 9. Bilan

### Ce qui est réalisé

**Architecture et infrastructure**

- Architecture complète backend/frontend/base de données
- Dockerisation des deux services
- Pipeline CI/CD complet (lint, tests, audit, deploy)
- Déploiement automatisé sur VPS

**Backend**

- API REST complète (15+ endpoints, pattern MVC)
- Authentification JWT sécurisée (inscription, vérification email, reset mot de passe)
- Système de rôles différenciés (admin, editor, writer, user)
- Web scraping FFVB (Puppeteer + Cheerio)
- Upload de fichiers (Multer)
- Envoi d'emails transactionnels (Nodemailer)
- Seed admin automatisé

**Frontend**

- Dashboard administrateur complet (Shadcn/ui + Tailwind v4)
- Gestion complète : saisons, équipes, membres, actualités, partenaires, users
- Pages d'authentification (login, register, verify, reset)
- Scraping déclenché depuis l'interface avec logs en temps réel
- Protection des routes admin par middleware

**Base de données**

- 11 modèles Mongoose
- Modélisation MERISE (MCD, MLD)
- Gestion des rôles saisonniers pour les membres (`teamRoles[]`)

### Points à finaliser

- Tests unitaires et E2E
- Pages publiques du site vitrine (accueil, équipes, actualités…)
- Refresh token (prolongation de session)
- Rate limiting (protection brute-force)
- MPD (modèle physique des données)

---

## 10. Annexes

- Cahier des charges : [docs/cahier-des-charges/](cahier-des-charges/)
- Cartographies : [docs/cartographies/](cartographies/)
- Modélisation données : [docs/data-conception/](data-conception/)
- Diagrammes UML : [docs/uml/](uml/)
- Workflow Git : [docs/workflow/](workflow/)
- Documentation backend : [docs/projet/backend/](projet/backend/)
- Documentation frontend : [docs/projet/frontend/](projet/frontend/)
