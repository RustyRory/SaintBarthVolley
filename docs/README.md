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

👉 **À consulter avant de commencer à coder**

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

👉 **Document de référence fonctionnel (non technique)**

---

## 📐 3. UML – Modélisation applicative

📁 **[docs/uml/](/docs/uml/)**

### Contenu
- Diagrammes de cas d’utilisation
- Diagrammes de classes
- Diagrammes de séquence
- Diagrammes d’activité (si présents)

### Objectifs
- Décrire le comportement de l’application
- Clarifier les interactions :
  - utilisateur ↔ front
  - front ↔ API
  - API ↔ base de données

👉 **Pont entre le fonctionnel et le code**

---

## 🗺️ 4. Cartographies

📁 **[docs/cartographies/](/docs/cartographies/)**

### Contenu
- Cartographie applicative
- Cartographie des flux de données
- Séparation Front / Back / Services externes
- Intégrations tierces (FFVB, SportEasy, Google Maps…)

### Objectifs
- Visualiser l’architecture globale
- Identifier les dépendances
- Anticiper les points critiques (scraping, APIs externes)

👉 **Très utile pour l’onboarding et la maintenance**

---

## 🎨 5. Maquettes UX / UI

📁 **[docs/maquettes/](/docs/maquettes/)**

### Contenu
- Maquettes desktop & mobile
- Parcours utilisateur
- Pages publiques
- Interfaces back-office

### Objectifs
- Aligner design, UX et développement
- Réduire les allers-retours front-end
- Garantir la cohérence avec la charte graphique

👉 **Référence principale pour le développement React**

---

## 🗄️ 6. Conception des données

📁 **[docs/data-conception/](/docs/data-conception/)**

### Contenu
- Dictionnaire de données
- MCD (Modèle Conceptuel de Données)
- MLD (Modèle Logique de Données)
- MPD (Modèle Physique – MongoDB)
- Règles de gestion des données

### Objectifs
- Structurer la base MongoDB
- Garantir la cohérence des schémas
- Faciliter l’écriture des modèles Mongoose
- Préparer l’historisation (saisons, archives)

👉 **Document central pour le back-end**
