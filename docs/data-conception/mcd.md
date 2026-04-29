# MCD — Modèle Conceptuel de Données

> Modélisation MERISE — vue conceptuelle indépendante de la technologie

---

## Entités

### UTILISATEUR
```
UTILISATEUR
─────────────────────
email
motDePasse
rôle
prénom
nom
actif
vérifié
```

### CLUB
```
CLUB
─────────────────────
nom
slogan
descriptionAccueil
descriptionClub
motPrésident
email
téléphone
adresse
réseauxSociaux (embarqué)
mentionsLégales (embarqué)
```

### SAISON
```
SAISON
─────────────────────
nom
dateDébut
dateFin
statut
```

### ÉQUIPE
```
ÉQUIPE
─────────────────────
nom
catégorie
genre
niveau
horairesEntraînement
codeFFVB
archivée
```

### MEMBRE
```
MEMBRE
─────────────────────
prénom
nom
type
rôle
dateNaissance
poste
taille
poids
photo
biographie
actif
```

### ACTUALITÉ
```
ACTUALITÉ
─────────────────────
titre
slug
contenu
publiée
àLaUne
datePublication
```

### ALBUM
```
ALBUM
─────────────────────
titre
description
dateÉvénement
public
```

### MÉDIA
```
MÉDIA
─────────────────────
url
type
ordre
```

### PARTENAIRE
```
PARTENAIRE
─────────────────────
nom
description
logo
siteWeb
priorité
actif
```

### CHAMPIONNAT_FFVB
```
CHAMPIONNAT_FFVB
─────────────────────
urlFédération
```

### CLASSEMENT_FFVB
```
CLASSEMENT_FFVB
─────────────────────
nomÉquipe
rang
points
matchsJoués
victoires
défaites
setsPour
setsContre
```

### MATCH_FFVB
```
MATCH_FFVB
─────────────────────
idFédération
date
domicileExtérieur
statut
setsPour
setsContre
détailSets
nomAdversaire
```

### JOURNAL_SCRAPING
```
JOURNAL_SCRAPING
─────────────────────
source
statut
message
dateExécution
```

---

## Associations

| Association | Entité A | Card. A | Card. B | Entité B | Note |
|---|---|---|---|---|---|
| CONTENIR | SAISON | 1,1 | 0,n | ÉQUIPE | Une saison contient plusieurs équipes |
| HISTORISER | SAISON | 1,1 | 0,n | MEMBRE | Un membre est rattaché à une saison |
| COMPOSER | ÉQUIPE | 0,n | 0,n | MEMBRE | Association porteuse : `fonctionDansÉquipe` |
| RÉDIGER | UTILISATEUR | 1,1 | 0,n | ACTUALITÉ | Un utilisateur rédige des actualités |
| ILLUSTRER | ACTUALITÉ | 0,1 | 0,1 | ALBUM | Une actualité est illustrée par un album |
| CONTENIR | ALBUM | 1,1 | 1,n | MÉDIA | Un album contient des médias |
| COLLABORER | CLUB | 1,1 | 0,n | PARTENAIRE | Le club collabore avec des partenaires |
| PARTICIPER | ÉQUIPE | 1,1 | 0,1 | CHAMPIONNAT_FFVB | Une équipe participe à un championnat |
| APPARTENIR | CHAMPIONNAT_FFVB | 1,1 | 1,n | CLASSEMENT_FFVB | Un championnat génère un classement |
| COMPRENDRE | CHAMPIONNAT_FFVB | 1,1 | 0,n | MATCH_FFVB | Un championnat comprend des matchs |
| JOURNALISER | SAISON | 1,1 | 0,n | JOURNAL_SCRAPING | Les logs sont liés à une saison |

---

## Association porteuse

### COMPOSER (ÉQUIPE ↔ MEMBRE)

```
COMPOSER
─────────────────────
fonctionDansÉquipe
```

Une équipe peut avoir plusieurs membres, un membre peut appartenir à plusieurs équipes (sur différentes saisons).
