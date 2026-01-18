# MCD

## ENTITÉS

### UTILISATEUR

UTILISATEUR
-------------------
email
motDePasse
rôle
prénom
nom
actif

### CLUB

CLUB
-------------------
nom
slogan
descriptionAccueil
descriptionClub
motPrésident
email
téléphone
adresse

### SAISON

SAISON
-------------------
nom
dateDébut
dateFin
statut

### ÉQUIPE

ÉQUIPE
-------------------
nom
catégorie
genre
niveau
horairesEntraînement
codeFFVB
archivée

### MEMBRE

MEMBRE
-------------------
prénom
nom
type
rôle
dateNaissance
poste
taille
poids
actif

### ACTUALITÉ

ACTUALITÉ
-------------------
titre
slug
contenu
publiée
àLaUne
datePublication

### ALBUM

ALBUM
-------------------
titre
description
dateÉvénement
public

### MÉDIA

MÉDIA
-------------------
url
type
ordre

### PARTENAIRE

PARTENAIRE
-------------------
nom
description
siteWeb
priorité
actif

### CHAMPIONNAT_FFVB
CHAMPIONNAT_FFVB
-------------------
urlFédération

### CLASSEMENT_FFVB

CLASSEMENT_FFVB
-------------------
nomÉquipe
rang
points
matchsJoués
victoires
défaites
setsPour
setsContre

### MATCH_FFVB

MATCH_FFVB
-------------------
idFédération
date
domicileExtérieur
statut
setsPour
setsContre
détailSets
nomAdversaire

### JOURNAL_SCRAPING

JOURNAL_SCRAPING
-------------------
source
statut
message
dateExécution

## ASSOCIATIONS

### APPARTENIR
CLUB (1,1) —— APPARTENIR —— (0,n) ÉQUIPE
Un club possède plusieurs équipes
Une équipe appartient à un seul club

### CONCERNER
SAISON (1,1) —— CONCERNER —— (0,n) ÉQUIPE

### COMPOSER
ÉQUIPE (0,n) —— COMPOSER —— (0,n) MEMBRE


Association porteuse : COMPOSER

COMPOSER
-------------------
fonctionDansÉquipe

### HISTORISER
SAISON (1,1) —— HISTORISER —— (0,n) MEMBRE

### RÉDIGER
UTILISATEUR (1,1) —— RÉDIGER —— (0,n) ACTUALITÉ

### ILLUSTRER
ACTUALITÉ (0,1) —— ILLUSTRER —— (0,1) ALBUM

### CONTENIR
ALBUM (1,1) —— CONTENIR —— (1,n) MÉDIA

### COLLABORER
CLUB (1,1) —— COLLABORER —— (0,n) PARTENAIRE

### PARTICIPER
ÉQUIPE (1,1) —— PARTICIPER —— (0,1) CHAMPIONNAT_FFVB

### GÉNÉRER
CHAMPIONNAT_FFVB (1,1) —— GÉNÉRER —— (1,n) CLASSEMENT_FFVB

### COMPRENDRE
CHAMPIONNAT_FFVB (1,1) —— COMPRENDRE —— (1,n) MATCH_FFVB

### JOURNALISER
SAISON (1,1) —— JOURNALISER —— (0,n) JOURNAL_SCRAPING
