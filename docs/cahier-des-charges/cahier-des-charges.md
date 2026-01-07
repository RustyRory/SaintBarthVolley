# Cahier des Charges  
## Projet Numérique du Club de Volley de Saint-Barthélemy-d’Anjou

---

## 1. Contexte du projet

### 1.1 Présentation de l’association
Le club de volley de Saint-Barthélemy-d’Anjou (49) regroupe des équipes séniors, jeunes et loisirs.  
Il dispose d’une équipe masculine évoluant en Nationale 3 et d’une équipe féminine engagée en Régional.

Le club ambitionne de poursuivre son développement dans les divisions nationales et de construire un projet sportif structurant afin d’assurer la progression et la pérennité de l’association.

> **Note** : L’histoire du club sera à compléter ultérieurement avec le président.

---

### 1.2 Organisation interne
Organisation du club autour de plusieurs pôles :
- Comité sportif / équipes
- Comité communication
- Comité administratif
- Comité événements / partenariats

> **Note** : L’organisation détaillée du club sera à compléter ultérieurement avec le président.

---

## 2. Objectif global
Le club ne dispose actuellement d’aucun site web officiel.  
Sa visibilité se limite aux réseaux sociaux, sans référencement sur les moteurs de recherche.

Cette absence de plateforme centrale empêche :
- la centralisation des informations,
- la valorisation des équipes et des événements,
- une communication structurée avec les adhérents et partenaires.

Ce projet constitue donc une opportunité de créer un site web officiel et de structurer la présence en ligne du club.

**Objectif principal** :  
Moderniser la communication du club via un site web vitrine et préparer une structure numérique plus professionnelle.

---

## 3. Situation actuelle
- Utilisation d’outils informels (réseaux sociaux, documents partagés)
- Absence de site web centralisé
- Manque d’outils pour gérer l’information et la communication
- Distribution des contenus artisanale

---

## 4. Objectifs généraux
- Structurer et professionnaliser l’écosystème numérique du club
- Créer un site web vitrine moderne et attractif
- Renforcer l’identité visuelle existante
- Faciliter la communication interne et externe
- Simplifier l’accès aux informations (équipes, planning, licences…)
- Mettre en avant les partenaires
- Permettre à l’équipe de gérer le contenu via un back-office simple

---

## 5. Périmètre fonctionnel et technique

### 5.1 Identité visuelle
*(Identité visuelle déjà définie — application et déclinaisons)*  
- Intégration du logo existant
- Respect de la palette de couleurs
- Respect des typographies
- Déclinaisons web si nécessaires (icônes, visuels)

---

### 5.2 Supports de communication

#### Print (déjà définis)
- Affiches d’événements
- Flyers d’inscription
- Plaquette partenaires

#### Web & réseaux sociaux (déjà définis)
- Visuels pour réseaux sociaux
- Templates pour annonces de matchs
- Visuels pour campagnes partenaires

---

### 5.3 Site web

#### Accès & navigation (public)
- Consultation des informations publiques du club
- Navigation responsive (mobile, tablette, desktop)
- Accès aux informations pratiques (lieux, horaires, contacts)
- Formulaire de contact

---

#### Équipes & joueurs
- Liste des équipes
- Détail d’une équipe (effectif, coachs, entraînements)
- Fiche joueur
- Filtrage par catégorie (jeunes, séniors, loisirs)
- Filtrage par saison
- Consultation des équipes archivées

---

#### Saisons & archivage
- Création d’une nouvelle saison (administrateur)
- Association d’équipes à une saison
- Archivage automatique des équipes en fin de saison
- Consultation des archives par saison (visiteur)
- Duplication des équipes d’une saison à l’autre (administrateur)

---

#### Actualités & contenus
- Consultation des actualités
- Publication d’actualités (administrateur)
- Gestion des actualités à la une
- Gestion de l’affichage sur la page d’accueil

---

#### Galerie & médias
- Consultation de la galerie photo
- Albums par événement ou par équipe
- Gestion des albums et médias (administrateur)

---

#### Partenaires
- Liste des partenaires
- Fiche partenaire
- Gestion des partenaires (ajout, modification, suppression)

---

#### Résultats & classements FFVB (automatique)
- Scraping automatique des résultats FFVB
- Mise à jour automatique des classements
- Affichage des résultats et classements par équipe
- Mise à jour après chaque journée de championnat
- Historisation des données par saison
- Gestion des erreurs de scraping (fallback / alertes)

---

#### Intégrations externes
- Redirection vers SportEasy (boutique)
- Redirection vers SportEasy (licences)
- Intégration Google Maps (lieux)

---

### 5.4 Back-office & administration
- Connexion sécurisée
- Gestion des rôles administrateurs
- Gestion des équipes (ajout, modification, archivage)
- Gestion des joueurs
- Gestion des saisons
- Gestion des contenus
- Mise à jour autonome sans intervention technique

---

### 5.5 Système & technique
- Hébergement sécurisé (VPS)
- Déploiement automatisé
- Base de données MongoDB
- API interne (Node.js / Express)
- Frontend React
- Tâches planifiées (cron jobs)
- Sauvegardes régulières
- Sécurisation des données (HTTPS, RGPD)

---

## 6. Analyse & communication
- Analyse du trafic (Matomo ou Google Analytics)
- Gestion de la newsletter (optionnel)

---

## 7. Contraintes
- Budget limité (club associatif)
- Niveau technique modéré côté club
- Simplicité d’utilisation impérative
- Respect strict de la charte graphique
- Respect des contraintes légales et RGPD

---

## 8. Livrables
- Site web complet
- Back-office simple
- Documentation technique
- Guide d’utilisation
- Visuels web
- Supports print
- Plan de cybersécurité de base

---

## 9. Planning prévisionnel
- Phase 1 : Analyse & cadrage
- Phase 2 : Maquettes UX/UI
- Phase 3 : Développement web (MERN)
- Phase 4 : Intégration des contenus
- Phase 5 : Tests
- Phase 6 : Mise en production
- Phase 7 : Formation & maintenance légère

> *(Dates exactes à définir, idéalement pour la saison 2026–2027)*

---

## 10. Organisation & rôles
Projet réalisé par une équipe bénévole :
- 2 développeurs
- 1 designer UX/UI – Web design
- 1 créateur numérique (contenus & visuels)
- Responsable communication du club

---

## 11. Critères de validation
- Respect de la charte graphique
- Fonctionnalités opérationnelles
- Simplicité d’utilisation
- Performance du site
- Accessibilité
- Sécurité & conformité RGPD
- Satisfaction du club
- Respect des délais

---

## 12. Annexes
- Inspirations visuelles
- Contenus fournis par le club
- Notes de réunions
