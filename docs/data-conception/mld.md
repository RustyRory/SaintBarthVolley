# MLD – Site web club de volley (MERISE)

## UTILISATEUR
```
UTILISATEUR (
idUtilisateur,
email,
motDePasse,
rôle,
prénom,
nom,
actif,
dernièreConnexion,
dateChangementMotDePasse
)
```

## CLUB
```
CLUB (
idClub,
nom,
slogan,
descriptionAccueil,
descriptionClub,
motPrésident,
email,
téléphone,
adresse
)
```

## SAISON
```
SAISON (
idSaison,
nom,
dateDébut,
dateFin,
statut
)
```

## ÉQUIPE
```
ÉQUIPE (
idÉquipe,
nom,
catégorie,
genre,
niveau,
horairesEntraînement,
codeFFVB,
archivée,
[idClub],
[idSaison]
)
```

## MEMBRE
```
MEMBRE (
idMembre,
prénom,
nom,
type,
rôle,
dateNaissance,
poste,
taille,
poids,
actif
)
```

## COMPOSER (association ÉQUIPE ↔ MEMBRE)
```
COMPOSER (
idComposer,
fonctionDansÉquipe,
[idÉquipe],
[idMembre]
)
```

## ACTUALITÉ
```
ACTUALITÉ (
idActualité,
titre,
slug,
contenu,
publiée,
àLaUne,
datePublication,
[idUtilisateur]
)
```

## ALBUM
```
ALBUM (
idAlbum,
titre,
description,
dateÉvénement,
public
)
```

## ILLUSTRER (ACTUALITÉ ↔ ALBUM)
```
ILLUSTRER (
idIllustrer,
[idActualité],
[idAlbum]
)
```

Association : 0,1 — 0,1

## MÉDIA
```
MÉDIA (
idMédia,
url,
type,
ordre,
[idAlbum]
)
```

## PARTENAIRE
```
PARTENAIRE (
idPartenaire,
nom,
description,
siteWeb,
priorité,
actif,
[idClub]
)
```

## CHAMPIONNAT_FFVB
```
CHAMPIONNAT_FFVB (
idChampionnat,
urlFédération,
[idÉquipe],
[idSaison]
)
```

## CLASSEMENT_FFVB
```
CLASSEMENT_FFVB (
idClassement,
nomÉquipe,
rang,
points,
matchsJoués,
victoires,
défaites,
setsPour,
setsContre,
[idChampionnat]
)
```

## MATCH_FFVB
```
MATCH_FFVB (
idMatch,
idFédération,
date,
domicileExtérieur,
statut,
setsPour,
setsContre,
détailSets,
nomAdversaire,
[idChampionnat]
)
```

## JOURNAL_SCRAPING
```
JOURNAL_SCRAPING (
idJournal,
source,
statut,
message,
dateExécution,
[idSaison]
)```