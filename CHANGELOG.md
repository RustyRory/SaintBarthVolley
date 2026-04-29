# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Ajouté

- 

### Changement

- 

### Corrigé

- 

### Supprimé

- 

---

## [0.4.1] - 2026-04-29

### Corrigé

- Déploiement : `NEXT_BASE_PATH` corrigé de `/saintbarth` vers `/saintbarthvolley` dans le Dockerfile
- Déploiement : `NEXT_PUBLIC_API_URL` corrigé en URL absolue (`http://78.138.58.95/saintbarthvolley`) pour le bon fonctionnement du SSR Next.js
- CI : regex commit et titre PR mis à jour pour accepter `fixes` en minuscule (`[Ff]ixes`)
- Pages visiteur : ajout de `export const dynamic = "force-dynamic"` sur le layout visiteur pour éviter le timeout de génération statique au build

---

## [0.4.0] - 2026-04-29

### Ajouté

- Site visiteur
    - Page d'accueil
        - Section « À la une » : carousel des articles marqués à la une, 3 articles par page, navigation par points et flèches
        - Section partenaires : carousel des partenaires actifs (logo cliquable, 4 par page) avec navigation
        - Section « Prêt à nous rejoindre ? » : affichage du lien d'inscription en ligne si renseigné, sinon affichage du téléphone et de l'e-mail du club pour contact direct
    - Page Actualités (`/actualites`)
        - Onglet Articles en premier (anciennement Calendrier)
        - Calendrier : nouvelle vue par défaut « Tous les événements à venir » (matchs + événements club mélangés, ordre chronologique croissant)
        - Calendrier : vue dédiée « Événements du club » (loto, AG, tournois, partenaires…) sans les matchs
        - Calendrier : badge « Match » sur les cartes de match pour distinguer des événements club
        - Calendrier : libellés des vues matchs clarifiés (« Matchs domicile à venir », « Matchs extérieur à venir »)
        - Calendrier : filtre équipe masqué sur les vues sans matchs
    - Page Contact (`/contact`)
        - E-mail, téléphone et adresse intégrés directement dans la card identité du club (cliquables : `mailto:`, `tel:`, Google Maps)
        - Suppression des pills de coordonnées redondantes
    - Backend : route `/api/events` — gestion des événements du club (CRUD complet)
    - Backend : modèle `Event` (titre, type, description, date, dateFin, lieu, équipe liée, visibilité publique)
    - Backend : route `/api/cup-phases` enregistrée dans `app.js`
    - Backend : `Album.teamIds` — association multi-équipes (tableau d'ObjectId au lieu d'un seul)
    - Backend : `News.teamId` — lien optionnel d'un article vers une équipe
    - Frontend : route API Next.js `/api/scrape-cup` — scraping serveur des phases de coupe FFVB (pas de CORS, cache 30 min)

- Dashboard administrateur
    - Navigation sidebar restructurée en groupes : « Site public », « Sportif », « Administration »
    - Page Événements (`/admin/events`) : CRUD complet, filtre par type (loto, AG, tournoi, partenaire, équipe, autre), bascule public/privé, layout mobile (cards) et desktop (tableau)
    - Page Albums & Médias (`/admin/albums`) : grille d'albums, upload de photo de couverture, panneau médias (upload multi-fichiers, suppression au survol), formulaire album avec sélection multi-équipes
    - Page Dashboard (`/admin`) : accès rapides reorganisés par groupe, nouvelles cards de stats (événements à venir, albums photo)
    - Stats API (`/api/stats`) : ajout de `totalEvents`, `upcomingEvents`, `totalAlbums`

### Changement

- Page d'accueil : section partenaires migrée vers données réelles (API `/api/partners`)
- Page d'accueil : section actualités migrée vers données réelles (articles `isFeatured` uniquement)
- Page d'accueil : CTA « Rejoindre » adapté selon présence ou non du lien d'inscription
- Page Club (`/club`) : suppression du badge « Notre club » au-dessus du titre dans le hero
- Page Actualités : onglet Articles affiché en premier
- Page Contact : layout allégé, coordonnées consolidées dans la card club
- Dashboard admin : `nav-main.tsx` refactorisé pour accepter des groupes (`NavGroup[]`) avec labels optionnels

### Supprimé

- Page Contact : card SportEasy
- Page Contact : section coordonnées en pills (fusionnée dans la card identité)

---

## [0.3.0] - 2026-04-09

### Ajouté

- Frontend
    - Installation Next.js (TypeScript, App Router, Tailwind CSS v4, Shadcn/ui)
    - Configuration du helper API centralisé (`src/lib/api.ts`)
    - Configuration des routes proxy Next.js (`/api/*`)
    - Middleware de protection des routes `/admin/*`
    - Pages d'authentification
        - Login
        - Register
        - Vérification d'email (`/verify-email`)
        - Mot de passe oublié (`/forgot-password`)
        - Réinitialisation du mot de passe (`/reset-password`)
    - Dashboard administrateur
        - Layout admin (sidebar + header)
        - Page d'accueil du dashboard (cartes de stats, déclenchement scraping avec logs)
        - Gestion du club (`/admin/club`)
        - Gestion des saisons (`/admin/seasons`)
        - Gestion des équipes par saison (`/admin/seasons/[seasonId]/teams`)
        - Gestion des membres (`/admin/members`)
        - Gestion des actualités (`/admin/news`)
        - Gestion des matchs (`/admin/matches`)
        - Gestion des partenaires (`/admin/partners`)
        - Gestion des utilisateurs et des rôles (`/admin/users`)
    - Composants réutilisables (formulaires CRUD, upload d'image, cartes stats)

### Corrigé

- CI : timeout SSH augmenté à 30 minutes pour le déploiement
- CI : suppression du script `prepare` avant `npm install` dans le build Docker backend
- CI : désactivation de Husky dans le build Docker backend
- CI : remplacement de `docker compose` par `docker-compose` pour compatibilité VPS

---

## [0.2.0] - 2026-02-11
### Ajouté

    /Backend
        server.js
        /src
            app.js
            /controllers
            /models
            /routes
    Scraping web
        Préparation des données “racines”
        Analyse de la page FFVB
        Script de scraping
        Mapping vers les modèles Mongo
        Scraping du classement
        Scraping des matchs
        Normalisation & sécurité
        Automatisation
    Authentification

      
---

## [0.1.0] - 2026-01-21

### Ajouté

- Documentation 
    - Cartographie
      - Fonctionnelle
      - Technique
      - Déploiement

---

## [0.0.4] - 2026-01-21

### Ajouté

- Documentation 
    - UML
      - Activités
      - Séquences
      - Utilisations
      - Classes
  
### Changement

- workflow
    - release
    - hotfix
- README.md

---

## [0.0.3] - 2026-01-18

### Ajouté

- Documentation
    - data.md
    - mcd.md
    - mld.md
  
### Changement

- workflow
- README.md

---

## [0.0.2] - 2025-12-28

### Ajouté

- Documentation
    - cahier-des-charges.md
  
### Changement

- README.md

---

## [0.0.1] - 2025-12-28

### Ajouté

- Workflow github
    - Vérification du nom de branche
    - Vérification de la présence d’une issue
    - Ajout automatique de labels à la PR
    - Vérification des messages de commit
    - Vérification de la structure du projet
        - Fichiers racine 
            - README.md
            - CONTRIBUTING.md
            - INSTALL.md
            - LICENSE
        - Dossiers MERN : 
            - frontend
            - backend
        - Tests unitaires et build
        - Linting (ESLint / Prettier)
        - Pre-commit
        - Audit des dépendances
        - Release & versioning
- Documentation
    - workflow.md


