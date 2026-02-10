# 📘 Documentation – Projet Numérique du Club de Volley de Saint Barthélemy d’Anjou

Ce dossier `docs/` regroupe l’ensemble des documents de **conception, organisation et développement** du projet numérique du club de volley de Saint Barthélemy d’Anjou.

L’objectif de cette documentation est double :
- Fournir une **vision claire et structurée** du projet pour tous les contributeurs
- Servir de **référence technique** tout au long du développement et de la maintenance

Ce README agit comme un **sommaire détaillé**, expliquant le rôle de chaque document et la manière dont ils s’enchaînent dans le cycle de développement.

---

## 🧭 Vue d’ensemble du projet

- **Type de projet** : Site web + back-office
- **Architecture** : MERN (MongoDB, Express, React, Node.js)
- **Public cible** : visiteurs, adhérents, bénévoles, administrateurs du club
- **Objectif principal** : structurer et professionnaliser la présence numérique du club

---

## 📂 Organisation du dossier `docs/`

```text
docs/
├── workflow/
├── cahier-des-charges/
├── uml/
├── cartographies/
├── maquettes/
├── data-conception/
└── README.md
```

# Structure de la documentation du projet

Chaque dossier correspond à une étape clé du cycle projet, de l’idée au code.

---

## 🔁 1. Workflow & Organisation de développement

📁 **[docs/workflow/](/docs/workflow/workflow.md)**

### Contenu
- Résumé du workflow Git (branches, commits, releases)
- Règles de nommage (branches, commits, versions)
- Processus CI/CD (GitHub Actions)
- Fonctionnement de **pre-commit** (linters, formatters)

### Objectifs
- Garantir une qualité de code constante
- Uniformiser les pratiques entre développeurs
- Sécuriser les merges vers `main`

---

## 📝 2. Cahier des charges

📁 **[docs/cahier-des-charges/](/docs/cahier-des-charges/cahier-des-charges.md)**

### Contenu
- Contexte du club
- Objectifs fonctionnels et stratégiques
- Périmètre du projet
- Contraintes (budget, RGPD, technique)
- Planning prévisionnel
- Critères de validation

### Objectifs
- Servir de référence fonctionnelle
- Justifier les choix techniques
- Éviter les dérives fonctionnelles (*scope creep*)

---

## 📐 3. UML – Modélisation applicative

📁 **[docs/uml/](/docs/uml/)**

### Contenu
- [Diagrammes de cas d’utilisation](/docs/uml/utilisation.md)
- [Diagrammes de classes](/docs/uml/classes.md)
- [Diagrammes de séquence](/docs/uml/sequence.md)
- [Diagrammes d’activité](/docs/uml/activite.md)

### Objectifs
- Décrire le comportement de l’application
- Clarifier les interactions :
  - utilisateur ↔ front
  - front ↔ API
  - API ↔ base de données

---

## 🗺️ 4. Cartographies

📁 **[docs/cartographies/](/docs/cartographies/)**

### Contenu
- [Cartographie fonctionnelle](/docs/cartographies/fonctionnelle)
- [Cartographie technique](/docs/cartographies/technique)
- [Cartographie de déploiement](/docs/cartographies/deploiement)

### Objectifs
- Visualiser l’architecture globale
- Identifier les dépendances
- Anticiper les points critiques (scraping, APIs externes)

---

## 🎨 5. Maquettes UX / UI

📁 **[docs/maquettes/](/docs/maquettes/)**

### Contenu
- Wireframes
- Maquettes desktop & mobile
- Parcours utilisateur
- Pages publiques
- Interfaces back-office

### Objectifs
- Aligner design, UX et développement
- Réduire les allers-retours front-end
- Garantir la cohérence avec la charte graphique

---

## 🗄️ 6. Conception des données

📁 **[docs/data-conception/](/docs/data-conception/)**

### Contenu
- [Dictionnaire de données](/docs/data-conception/data.md)
- [MCD (Modèle Conceptuel de Données)](/docs/data-conception/mcd.md)
- [MLD (Modèle Logique de Données)](/docs/data-conception/mld.md)
- [MPD (Modèle Physique – MongoDB)](/docs/data-conception/mpd.md)
- Règles de gestion des données

### Objectifs
- Structurer la base MongoDB
- Garantir la cohérence des schémas
- Faciliter l’écriture des modèles Mongoose
- Préparer l’historisation (saisons, archives)

---

##  7. Backend

**[docs/backend](/docs/project/backend.md/)**

### Contenu
- Installation et configuration de Node.js et Express
- Structure du projet backend (server.js, src/app.js, routes, controllers, models, middlewares)
- Connexion à MongoDB avec Mongoose et configuration des variables d’environnement via .env
- Création d’une API REST CRUD pour les articles (GET, POST, PUT, DELETE)
- Exemple de modèle Mongoose (Article) et contrôleur associé
- Mise en place d’un serveur Express fonctionnel avec test via navigateur ou Postman

### Objectifs
- Fournir une API backend pour le site du club de volley, capable de gérer les contenus dynamiques (articles, pages, partenaires, équipes, galerie…)
- Assurer une architecture claire et maintenable pour ajouter facilement de nouvelles fonctionnalités
- Préparer la connexion avec le frontend React et permettre un back-office sécurisé pour les administrateurs
- Utiliser MongoDB de manière flexible, avec création automatique des bases et collections à l’insertion de documents
- Permettre le développement rapide grâce à nodemon et à une configuration simple des routes et contrôleurs

**[docs/scraping](/docs/project/scraping.md/)**

### Contenu

### Objectifs

**[docs/authentification](/docs/project/auth.md/)**

### Contenu

### Objectifs