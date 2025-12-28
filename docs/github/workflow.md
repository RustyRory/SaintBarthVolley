# Workflow Github Actions

### Objectif

- Un workflow Git propre et sécurisé
- Des branches cohérentes
- Des issues traçables
- Vérification des commits
- Des PR contrôlées
- Un changelog écrit à la main selon norme [Keepachangelog](https://keepachangelog.com/fr/1.0.0/)
- Des releases propres

### Ce que GitHub fera pour toi

- Bloquer les erreurs
- Automatiser ce qui est répétitif
- Forcer aux bonnes pratiques

## ÉTAPE 1 — Vérification du nom de branche

`.github/workflows/branch-name.yml`

Vérifier que le nom de branche suit la convention :

```
feature/<issue-id>-short-description
fix/<issue-id>-short-description
hotfix/<issue-id>-short-description
release/<x.y.z>
```

Bloque la PR si le nom est invalide.
Affiche un message clair pour corriger.

## ÉTAPE 2 — Vérification de la présence d’une issue

`.github/workflows/ticket.yml`

Vérifie que le titre de la PR ou le nom de la branche contient une référence à une issue (#<numéro>).
Bloque la PR si aucune issue n’est liée.

## ÉTAPE 3 — Ajout automatique de labels à la PR

`.github/workflows/labels.yml`

Ajoute automatiquement les labels à la PR selon le type de branche : feature, fix, hotfix, release.
Avertit si aucun label n’est ajouté (nom de branche invalide).

## ÉTAPE 4 — Vérification des messages de commit

`.github/workflows/commit-message.yml`

Format attendu :

```
type(nom): Fixes #<issue> - message
```

- type : feat, fix, docs, chore, refactor, test, hotfix
- nom : le nom de la fonctionnalité ou du module
- #<numéro> : référence à l’issue
- message : texte libre décrivant le commit

Blocage du push/PR si un commit ne respecte pas le format

Exemple de commits valides :

```
feat(login): Fixes #3 - Ajout page login
docs(readme): Fixes #6 - Mise à jour du README
fix(api): Fixes #10 - Correction timeout API
hotfix(prod): Fixes #12 - Correction crash production
```

## ÉTAPE 5 — Vérification de la structure du projet

`.github/workflows/structure.yml`

- Fichiers racine obligatoires : README.md, CONTRIBUTING.md, INSTALL.md, LICENSE
- Dossiers MERN : frontend et backend
- Vérification interne des dossiers :
  - frontend/package.json et .env.example
  - backend/package.json et .env.example
- Message clair pour chaque fichier/dossier manquant
- Blocage de la PR avec exit 1 si des fichiers sont absents

## ÉTAPE 6 — Tests unitaires et build

`.github/workflows/tests.yml`

Installe les dépendances et lance les tests pour backend et frontend :

```
cd backend && npm install && npm test
cd ../frontend && npm install && npm test
```

Optionnel : build frontend pour vérifier que l’application compile correctement.

## ÉTAPE 7 — Linting (ESLint / Prettier)

`.github/workflows/lint.yml`

Vérifie le style et la cohérence du code :

```
cd backend && npx eslint . --ext .js,.ts
cd ../frontend && npx eslint . --ext .js,.jsx
npx prettier --check .
```

Bloque la PR si des fichiers ne respectent pas les règles.

## ÉTAPE 8 — Pre-commit

### Qu'est-ce que pre-commit ?

`pre-commit` est un outil qui exécute automatiquement des vérifications avant chaque commit Git pour empêcher d’envoyer du code mal formaté ou non conforme.

Il agit avant que le commit soit créé (en local).
- outil Python
- installé avec pip
- indépendant du stack

### Installation (une seule fois par développeur)
```
pip install pre-commit        
pre-commit install
```
Cela installe un hook Git dans .git/hooks/pre-commit.

### Configuration du projet

Dans `.pre-commit-config.yaml`, définition de :

- quels outils lancer (ESLint, Prettier, etc.)
- sur quels fichiers
- dans quel dossier (frontend / backend)

Ce fichier est versionné → toute l’équipe a le même comportement.

### Fonctionnement

- git add .
- git commit -m "feat(login): Fixes #3 - Ajout page login"
- Déclenchement du hook pre-commit :
  - Lint du code
  - Tests unitaires
- Si une étape échoue, le commit est bloqué et un message s’affiche.
- Si tout passe, le commit est effectué normalement.

## ÉTAPE 9 — Audit des dépendances

`.github/workflows/audit.yml`

Vérifie automatiquement la sécurité des packages npm :

```
cd server && npm audit --audit-level=high
cd ../client && npm audit --audit-level=high
```

Bloque la PR si des vulnérabilités critiques sont détectées.

## ÉTAPE 10 — Release & versioning

`.github/workflows/release.yml`

- Détecte les branches release/x.y.z.
- Vérifie que la version respecte le format SemVer.
- Crée le tag git et pousse sur GitHub.
- Extrait la section correspondante dans CHANGELOG.md.
- Crée la GitHub Release.

# RÈGLES À RETENIR

- 1 issue = 1 branche
- Pas de push sur main
- Pas de merge sans PR
- Release = release/x.y.z
- Fichiers obligatoire

# Diagramme visuel

```
           ┌───────────────┐
           │ Issue github  │
           └─────┬─────────┘
                 │
                 ▼
           ┌──────────────┐
           │ Créer branche│
           │ feature/*    │
           │ fix/*        │
           │ hotfix/*     │
           │ release/*    │
           └─────┬────────┘
                 │
                 ▼
           ┌─────────────┐
           │ Ouvrir PR   │
           │ vers main   │
           └─────┬───────┘
                 │
       ┌─────────┴─────────┐
       │ Workflow GitHub   │
       │ (CI/CD checks)    │
       └─────────┬─────────┘
                 │
    ┌────────────┴─────────────┐
    │ Vérification du nom de   │
    │ branche et format ticket │
    └────────────┬─────────────┘
                 │
                 │ OK
                 ▼
          ┌─────────────┐
          │ Ajout labels│
          │ automatiques│
          └──────┬──────┘
                 │
                 ▼
          ┌─────────────┐
          │ PR mergée   │
          │ sur main    │
          └──────┬──────┘
                 │
                 ▼
         ┌─────────────────┐
         │ Branche release │
         │ détectée        │
         └───────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Vérifier format  │
        │ SemVer x.y.z     │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Créer et pousser │
        │ le tag git       │
        └────────┬─────────┘
                 │
                 ▼
        ┌───────────────────┐
        │ Extraire changelog│
        │ version correspond│
        └────────┬──────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Créer GitHub     │
        │ Release          │
        └──────────────────┘
```

# Tableau récapitulatif

| Workflow                                    | Fichier                                | Déclenchement                                            | Objectif                                                                                                                                                                         | Blocage / Messages                                                |
| ------------------------------------------- | -------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Vérification du nom de branche**          | `.github/workflows/branch-name.yml`    | PR ouverte, réouverte, mise à jour                       | Vérifie que le nom de branche suit la convention (`feature/123-desc`, `fix/456-desc`, `hotfix/789-desc`, `release/x.y.z`)                                                        | ❌ PR bloquée si nom invalide, message clair avec format attendu  |
| **Vérification de la présence d’une issue** | `.github/workflows/ticket.yml`         | PR ouverte, réouverte, mise à jour                       | Vérifie que le titre de PR ou le nom de branche contient `#<numéro>` d’une issue                                                                                                 | ❌ PR bloquée si aucune référence à une issue, message clair      |
| **Ajout automatique de labels**             | `.github/workflows/labels.yml`         | PR ouverte                                               | Ajoute un label selon le type de branche (`feature`, `bug`, `hotfix`, `release`)                                                                                                 | ⚠️ Message si aucun label ajouté                                  |
| **Vérification des messages de commit**     | `.github/workflows/commit-message.yml` | Push sur main/dev ou branches feature/fix/hotfix/release | Vérifie le format `type(nom): Fixes #<issue> - message`                                                                                                                          | ❌ Push/PR bloqué si un commit invalide, message clair            |
| **Vérification de la structure du projet**  | `.github/workflows/structure.yml`      | PR ouverte, réouverte, mise à jour                       | Vérifie fichiers racine (`README.md`, `CONTRIBUTING.md`, `INSTALL.md`, `LICENSE`) et dossiers MERN (`frontend`, `backend`) et fichiers internes (`package.json`, `.env.example`) | ❌ PR bloquée si un fichier/dossier manquant, message clair       |
| **Tests unitaires / build**                 | `.github/workflows/tests.yml`          | PR ouverte, réouverte, mise à jour                       | Installe les dépendances et lance les tests backend et frontend                                                                                                                  | ❌ PR bloquée si un test échoue ou dossier manquant               |
| **Linting (ESLint + Prettier)**             | `.github/workflows/lint.yml`           | PR ouverte, réouverte, mise à jour                       | Vérifie la qualité et la cohérence du code                                                                                                                                       | ❌ PR bloquée si des fichiers ne respectent pas les règles        |
| **Audit des dépendances**                   | `.github/workflows/audit.yml`          | PR ouverte, réouverte, mise à jour                       | Vérifie la sécurité des packages npm (`npm audit --audit-level=high`)                                                                                                            | ❌ PR bloquée si vulnérabilités critiques détectées               |
| **Release & versioning**                    | `.github/workflows/release.yml`        | PR fermée et mergée vers main depuis `release/x.y.z`     | Crée le tag git, extrait changelog et crée la GitHub Release                                                                                                                     | ❌ Release bloquée si format SemVer incorrect ou changelog absent |
