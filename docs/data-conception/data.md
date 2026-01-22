## users

| Champ               | Description                             |
| ------------------- | --------------------------------------- |
| `_id`               | Identifiant unique MongoDB              |
| `email`             | Email de connexion (**unique, indexé**) |
| `passwordHash`      | Mot de passe chiffré                    |
| `role`              | `admin` / `editor`                      |
| `firstName`         | Prénom                                  |
| `lastName`          | Nom                                     |
| `isActive`          | Compte actif                            |
| `lastLoginAt`       | Dernière connexion                      |
| `passwordUpdatedAt` | Dernière modification du mot de passe   |
| `createdAt`         | Date de création                        |
| `updatedAt`         | Date de mise à jour                     |



## club

| Champ              | Description                      |
| ------------------ | -------------------------------- |
| `_id`              | Identifiant unique               |
| `name`             | Nom du club                      |
| `subtitle`         | Slogan / sous-titre              |
| `homeDescription`  | Texte page d’accueil             |
| `clubDescription`  | Texte page "Le club"             |
| `ownerDescription` | Mot du président                 |
| `logo`             | Logo                             |
| `photo`            | Photo principale                 |
| `email`            | Email                            |
| `phone`            | Téléphone                        |
| `address`          | Adresse                          |
| `socialLinks`      | Réseaux sociaux                  |
| `legalInfo`        | Informations légales structurées |
| `createdAt`        | Date de création                 |
| `updatedAt`        | Date de modification             |

## social_links

| Champ       | Description    |
| ----------- | -------------- |
| `facebook`  | Lien Facebook  |
| `instagram` | Lien Instagram |
| `youtube`   | Lien YouTube   |
| `sporteasy` | Lien SportEasy |
| `website`   | Site officiel  |
| `other`     | Autre lien     |

## legal_info

| Champ             | Description          |
| ----------------- | -------------------- |
| `associationName` | Nom légal            |
| `legalForm`       | Loi 1901             |
| `siret`           | Numéro SIRET         |
| `rna`             | Numéro RNA           |
| `headOffice`      | Siège social         |
| `publicationDate` | Date JO              |
| `responsible`     | Responsable légal    |
| `hostingProvider` | Hébergeur            |
| `updatedAt`       | Dernière mise à jour |


## seasons

| Champ       | Description                      |
| ----------- | -------------------------------- |
| `_id`       | Identifiant saison               |
| `name`      | Nom (ex : 2025–2026)             |
| `startDate` | Date de début                    |
| `endDate`   | Date de fin                      |
| `status`    | `active` / `archived` / `future` |
| `createdAt` | Date de création                 |
| `updatedAt` | Date de modification             |



## teams

| Champ              | Description                |
| ------------------ | -------------------------- |
| `_id`              | Identifiant                |
| `name`             | Nom de l’équipe            |
| `category`         | Jeunes / Séniors / Loisirs |
| `gender`           | Masculin / Féminin / Mixte |
| `level`            | Niveau                     |
| `seasonId`         | Référence saison           |
| `trainingSchedule` | Horaires                   |
| `coachIds`         | Références membres coach   |
| `photo`            | Photo                      |
| `isArchived`       | Équipe archivée            |
| `createdAt`        | Date de création           |
| `updatedAt`        | Date de mise à jour        |


## members

| Champ       | Description                                   |
| ----------- | --------------------------------------------- |
| `_id`       | Identifiant                                   |
| `firstName` | Prénom                                        |
| `lastName`  | Nom                                           |
| `type`      | `player` / `staff` / `dirigeant` / `benevole` |
| `role`      | Rôle affiché                                  |
| `teamId`    | Équipe                                        |
| `seasonId`  | Saison                                        |
| `birthDate` | Date de naissance                             |
| `position`  | Poste                                         |
| `height`    | Taille                                        |
| `weight`    | Poids                                         |
| `photo`     | Photo                                         |
| `bio`       | Biographie                                    |
| `isActive`  | Actif                                         |
| `createdAt` | Date création                                 |
| `updatedAt` | Date MAJ                                      |

 

## news

| Champ         | Description      |
| ------------- | ---------------- |
| `_id`         | Identifiant      |
| `title`       | Titre            |
| `slug`        | URL SEO          |
| `content`     | Contenu          |
| `albumId`     | Album photo      |
| `authorId`    | User auteur      |
| `isPublished` | Publiée          |
| `isFeatured`  | À la une         |
| `publishedAt` | Date publication |
| `createdAt`   | Date création    |
| `updatedAt`   | Date MAJ         |


## album

| Champ         | Description          |
| ------------- | -------------------- |
| `_id`         | Identifiant          |
| `title`       | Nom de l’album       |
| `description` | Description          |
| `eventDate`   | Date événement       |
| `isPublic`    | Visible publiquement |
| `createdAt`   | Date création        |
| `updatedAt`   | Date MAJ             |


## media

| Champ       | Description       |
| ----------- | ----------------- |
| `_id`       | Identifiant       |
| `albumId`   | Album associé     |
| `url`       | URL               |
| `type`      | `photo` / `video` |
| `order`     | Ordre affichage   |
| `createdAt` | Date ajout        |
| `updatedAt` | Date MAJ          |


## partners

| Champ         | Description     |
| ------------- | --------------- |
| `_id`         | Identifiant     |
| `name`        | Nom             |
| `description` | Description     |
| `logo`        | Logo            |
| `website`     | Site web        |
| `priority`    | Ordre affichage |
| `isActive`    | Actif           |
| `createdAt`   | Date création   |
| `updatedAt`   | Date MAJ        |


## championships_ffvb

| Champ           | Description    |
| --------------- | -------------- |
| `_id`           | Identifiant    |
| `seasonId`      | Saison         |
| `teamId`        | Équipe du club |
| `federationUrl` | URL FFVB       |
| `createdAt`     | Date import    |
| `updatedAt`     | Date MAJ       |


## standings_ffvb

| Champ            | Description  |
| ---------------- | ------------ |
| `_id`            | Identifiant  |
| `championshipId` | Championnat  |
| `teamName`       | Nom équipe   |
| `rank`           | Classement   |
| `points`         | Points       |
| `played`         | Matchs joués |
| `wins`           | Victoires    |
| `losses`         | Défaites     |
| `setsFor`        | Sets pour    |
| `setsAgainst`    | Sets contre  |
| `createdAt`      | Date import  |
| `updatedAt`      | Dernière MAJ |



## matches_ffvb

| Champ               | Description            |
| ------------------- | ---------------------- |
| `_id`               | Identifiant            |
| `federationMatchId` | ID FFVB                |
| `championshipId`    | Championnat            |
| `opponentName`      | Adversaire             |
| `date`              | Date                   |
| `homeAway`          | `home` / `away`        |
| `status`            | `scheduled` / `played` |
| `scoreFor`          | Sets gagnés            |
| `scoreAgainst`      | Sets perdus            |
| `setsDetail`        | Détail des sets        |
| `createdAt`         | Date import            |
| `updatedAt`         | Date MAJ               |




## scraping_logs

| Champ       | Description         |
| ----------- | ------------------- |
| `_id`       | Identifiant         |
| `source`    | Source (`FFVB`)     |
| `seasonId`  | Saison              |
| `status`    | `success` / `error` |
| `message`   | Message             |
| `runAt`     | Date exécution      |
| `createdAt` | Date création       |
| `updatedAt` | Date MAJ            |

