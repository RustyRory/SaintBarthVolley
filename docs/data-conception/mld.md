# MLD — Modèle Logique de Données

> Modélisation MERISE — traduction du MCD en tables relationnelles

---

## UTILISATEUR
```
UTILISATEUR (
  idUtilisateur,
  email,            [unique, indexé]
  motDePasse,
  rôle,             [admin | editor | user]
  prénom,
  nom,
  actif,
  vérifié,
  dernièreConnexion,
  dateChangementMotDePasse,
  créeÀ,
  modifiéÀ
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
  adresse,
  créeÀ,
  modifiéÀ
)
```

> Note : `réseauxSociaux` et `mentionsLégales` sont des documents embarqués (MongoDB), traduits ici en tables séparées.

## RÉSEAUX_SOCIAUX
```
RÉSEAUX_SOCIAUX (
  idClub,           [FK → CLUB]
  facebook,
  instagram,
  youtube,
  sporteasy,
  clubMerch,
  inscriptions,
  siteWeb,
  autre
)
```

## MENTIONS_LÉGALES
```
MENTIONS_LÉGALES (
  idClub,           [FK → CLUB]
  nomAssociation,
  formeJuridique,
  siret,
  rna,
  siègeSocial,
  dateJO,
  responsable,
  hébergeur,
  modifiéÀ
)
```

## SAISON
```
SAISON (
  idSaison,
  nom,
  dateDébut,
  dateFin,
  statut,           [active | archived | future]
  créeÀ,
  modifiéÀ
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
  photo,
  #idSaison,        [FK → SAISON]
  créeÀ,
  modifiéÀ
)
```

## MEMBRE
```
MEMBRE (
  idMembre,
  prénom,
  nom,
  type,             [player | staff | dirigeant | benevole]
  rôle,
  dateNaissance,
  poste,
  taille,
  poids,
  photo,
  biographie,
  actif,
  #idÉquipe,        [FK → ÉQUIPE]
  #idSaison,        [FK → SAISON]
  créeÀ,
  modifiéÀ
)
```

## COMPOSER (association ÉQUIPE ↔ MEMBRE)
```
COMPOSER (
  idComposer,
  fonctionDansÉquipe,
  #idÉquipe,        [FK → ÉQUIPE]
  #idMembre         [FK → MEMBRE]
)
```

## ACTUALITÉ
```
ACTUALITÉ (
  idActualité,
  titre,
  slug,             [unique, indexé]
  contenu,
  publiée,
  àLaUne,
  datePublication,
  #idUtilisateur,   [FK → UTILISATEUR]
  #idAlbum,         [FK → ALBUM, nullable]
  créeÀ,
  modifiéÀ
)
```

## ALBUM
```
ALBUM (
  idAlbum,
  titre,
  description,
  dateÉvénement,
  public,
  créeÀ,
  modifiéÀ
)
```

## MÉDIA
```
MÉDIA (
  idMédia,
  url,
  type,             [photo | video]
  ordre,
  #idAlbum,         [FK → ALBUM]
  créeÀ,
  modifiéÀ
)
```

## PARTENAIRE
```
PARTENAIRE (
  idPartenaire,
  nom,
  description,
  logo,
  siteWeb,
  priorité,
  actif,
  créeÀ,
  modifiéÀ
)
```

## CHAMPIONNAT_FFVB
```
CHAMPIONNAT_FFVB (
  idChampionnat,
  urlFédération,
  #idÉquipe,        [FK → ÉQUIPE]
  #idSaison,        [FK → SAISON]
  créeÀ,
  modifiéÀ
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
  #idChampionnat,   [FK → CHAMPIONNAT_FFVB]
  créeÀ,
  modifiéÀ
)
```

## MATCH_FFVB
```
MATCH_FFVB (
  idMatch,
  idFédération,
  date,
  domicileExtérieur,[home | away]
  statut,           [scheduled | played]
  setsPour,
  setsContre,
  détailSets,
  nomAdversaire,
  #idChampionnat,   [FK → CHAMPIONNAT_FFVB]
  créeÀ,
  modifiéÀ
)
```

## JOURNAL_SCRAPING
```
JOURNAL_SCRAPING (
  idJournal,
  source,
  statut,           [success | error]
  message,
  dateExécution,
  #idSaison,        [FK → SAISON]
  créeÀ,
  modifiéÀ
)
```
