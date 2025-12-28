# Dictionnaire de données

## users

| Champ          | Description                |
| -------------- | -------------------------- |
| `_id`          | Identifiant unique MongoDB |
| `email`        | Email de connexion         |
| `passwordHash` | Mot de passe chiffré       |
| `role`         | Rôle (admin, editor)       |
| `firstName`    | Prénom                     |
| `lastName`     | Nom                        |
| `isActive`     | Compte actif ou non        |
| `createdAt`    | Date de création           |
| `updatedAt`    | Date de mise à jour        |

## club

| Champ         | Description          |
| ------------- | -------------------- |
| `_id`         | Identifiant unique   |
| `name`        | Nom du club          |
| `description` | Présentation du club |
| `email`       | Email de contact     |
| `phone`       | Téléphone            |
| `address`     | Adresse postale      |
| `socialLinks` | Réseaux sociaux      |
| `createdAt`   | Date de création     |
| `updatedAt`   | Date de modification |

## seasons

| Champ        | Description          |
| ------------ | -------------------- |
| `_id`        | Identifiant saison   |
| `name`       | Nom (ex : 2025-2026) |
| `startDate`  | Date de début        |
| `endDate`    | Date de fin          |
| `isActive`   | Saison en cours      |
| `isArchived` | Saison archivée      |
| `createdAt`  | Date de création     |

## teams

| Champ              | Description                |
| ------------------ | -------------------------- |
| `_id`              | Identifiant équipe         |
| `name`             | Nom de l’équipe            |
| `category`         | Jeunes / Séniors / Loisirs |
| `gender`           | Masculin / Féminin / Mixte |
| `level`            | Niveau (N3, R1…)           |
| `seasonId`         | Référence saison           |
| `trainingSchedule` | Horaires des entraînements |
| `isArchived`       | Équipe archivée            |
| `ffvbCode`         | Code équipe FFVB           |
| `createdAt`        | Date de création           |

## members

| Champ       | Description                             |
| ----------- | --------------------------------------- |
| `_id`       | Identifiant unique                      |
| `firstName` | Prénom                                  |
| `lastName`  | Nom                                     |
| `type`      | player, staff, dirigeant, bénévole      |
| `role`      | Rôle principal (coach, président, etc.) |
| `teamId`    | Référence vers l’équipe (optionnel)     |
| `seasonId`  | Référence saison (historisation)        |
| `birthDate` | Date de naissance (optionnel)           |
| `position`  | Poste joueur (optionnel)                |
| `photo`     | Photo                                   |
| `bio`       | Présentation / parcours                 |
| `isActive`  | Actif au club                           |
| `createdAt` | Date de création                        |
| `updatedAt` | Date de mise à jour                     |

## news 

| Champ         | Description                         |
| ------------- | ----------------------------------- |
| `_id`         | Identifiant                         |
| `title`       | Titre                               |
| `content`     | Contenu                             |
| `photo`       | Photo                               |
| `authorId`    | Référence auteur (users ou members) |
| `isPublished` | Publiée ou non                      |
| `isFeatured`  | À la une                            |
| `publishedAt` | Date de publication                 |
| `createdAt`   | Date de création                    |

## album

| Champ         | Description             |
| ------------- | ----------------------- |
| `_id`         | Identifiant             |
| `title`       | Nom de l’album          |
| `description` | Description             |
| `teamId`      | Équipe liée (optionnel) |
| `eventDate`   | Date de l’événement     |
| `createdAt`   | Date de création        |

## media

| Champ       | Description   |
| ----------- | ------------- |
| `_id`       | Identifiant   |
| `albumId`   | Album associé |
| `url`       | URL du média  |
| `type`      | Photo / Vidéo |
| `createdAt` | Date d’ajout  |

## partners

| Champ         | Description      |
| ------------- | ---------------- |
| `_id`         | Identifiant      |
| `name`        | Nom              |
| `description` | Description      |
| `logo`        | Logo             |
| `website`     | Site web         |
| `isActive`    | Actif            |
| `createdAt`   | Date de création |


## matches

| Champ               | Description          |
| ------------------- | -------------------- |
| `_id`               | Identifiant          |
| `federationMatchId` | ID FFVB              |
| `seasonId`          | Référence saison     |
| `teamId`            | Équipe concernée     |
| `opponent`          | Adversaire           |
| `date`              | Date du match        |
| `homeAway`          | Domicile / Extérieur |
| `scoreFor`          | Sets gagnés          |
| `scoreAgainst`      | Sets perdus          |
| `setsDetail`        | Détail des sets      |
| `createdAt`         | Date d’import        |

## standings

| Champ         | Description          |
| ------------- | -------------------- |
| `_id`         | Identifiant          |
| `seasonId`    | Référence saison     |
| `teamName`    | Nom de l’équipe      |
| `rank`        | Classement           |
| `points`      | Points               |
| `played`      | Matchs joués         |
| `wins`        | Victoires            |
| `losses`      | Défaites             |
| `setsFor`     | Sets pour            |
| `setsAgainst` | Sets contre          |
| `updatedAt`   | Dernière mise à jour |


## scraping_logs

| Champ      | Description      |
| ---------- | ---------------- |
| `_id`      | Identifiant      |
| `source`   | Source (FFVB)    |
| `seasonId` | Référence saison |
| `status`   | Succès / Erreur  |
| `message`  | Message d’erreur |
| `runAt`    | Date d’exécution |
