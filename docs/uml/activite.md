# UML — Diagrammes d'activité

---

## 1. Connexion administrateur

```mermaid
flowchart TD
    START([Début]) --> FORM[Saisir email et mot de passe]
    FORM --> SUBMIT[Soumettre le formulaire]
    SUBMIT --> CHECK_CRED{Identifiants valides ?}
    CHECK_CRED -->|Non| ERR1[Afficher message d'erreur]
    ERR1 --> FORM
    CHECK_CRED -->|Oui| CHECK_ACTIVE{Compte actif ?}
    CHECK_ACTIVE -->|Non| ERR2[Afficher "Compte inactif"]
    ERR2 --> END_ERR([Fin])
    CHECK_ACTIVE -->|Oui| JWT[Générer JWT + cookie httpOnly]
    JWT --> REDIRECT[Rediriger vers /admin]
    REDIRECT --> END([Fin])
```

---

## 2. Inscription utilisateur

```mermaid
flowchart TD
    START([Début]) --> FORM[Remplir formulaire<br/>prénom, nom, email, mot de passe]
    FORM --> VAL_PWD{Mot de passe<br/>conforme ?}
    VAL_PWD -->|Non| ERR_PWD[Afficher règles mot de passe]
    ERR_PWD --> FORM
    VAL_PWD -->|Oui| CHECK_EMAIL{Email déjà utilisé ?}
    CHECK_EMAIL -->|Oui| ERR_EMAIL[Afficher "Email déjà utilisé"]
    ERR_EMAIL --> FORM
    CHECK_EMAIL -->|Non| CREATE[Créer compte<br/>isActive: false<br/>isVerified: false]
    CREATE --> EMAIL[Envoyer email de vérification]
    EMAIL --> MSG[Afficher "Vérifiez votre email"]
    MSG --> VERIFY{Utilisateur clique<br/>le lien ?}
    VERIFY -->|Oui| VERIFIED[isVerified: true]
    VERIFIED --> WAIT[Attendre activation par admin]
    WAIT --> ACTIVATED{Admin active<br/>le compte ?}
    ACTIVATED -->|Oui| ACTIVE[isActive: true]
    ACTIVE --> END([Fin — compte opérationnel])
    ACTIVATED -->|Non| END_REF([Fin — accès refusé])
```

---

## 3. Gestion d'une équipe (cycle complet)

```mermaid
flowchart TD
    START([Début]) --> CREATE[Créer une équipe<br/>nom, catégorie, genre, niveau]
    CREATE --> LINK_SEASON[Associer à une saison]
    LINK_SEASON --> ADD_MEMBERS[Ajouter des membres<br/>joueurs et staff]
    ADD_MEMBERS --> LINK_FFVB{Équipe en championnat ?}
    LINK_FFVB -->|Oui| SET_URL[Renseigner URL FFVB]
    SET_URL --> SCRAPING[Activer le scraping]
    SCRAPING --> ACTIVE[Équipe active en saison]
    LINK_FFVB -->|Non| ACTIVE
    ACTIVE --> END_SEASON{Fin de saison ?}
    END_SEASON -->|Non| ACTIVE
    END_SEASON -->|Oui| ARCHIVE{Dupliquer pour<br/>nouvelle saison ?}
    ARCHIVE -->|Oui| DUPLICATE[Dupliquer l'équipe<br/>vers nouvelle saison]
    DUPLICATE --> NEW_SEASON[Nouvelle équipe<br/>saison suivante]
    NEW_SEASON --> END([Fin])
    ARCHIVE -->|Non| SET_ARCHIVED[isArchived: true]
    SET_ARCHIVED --> END
```

---

## 4. Publication d'une actualité

```mermaid
flowchart TD
    START([Début]) --> WRITE[Rédiger le titre et le contenu]
    WRITE --> DRAFT[Sauvegarder en brouillon<br/>isPublished: false]
    DRAFT --> REVIEW{Prêt à publier ?}
    REVIEW -->|Non| WRITE
    REVIEW -->|Oui| PUBLISH[Publier<br/>isPublished: true<br/>publishedAt: now] 
    PUBLISH --> FEATURED{Mettre à la une ?}
    FEATURED -->|Oui| SET_FEAT[isFeatured: true<br/>Visible sur la home]
    FEATURED -->|Non| VISIBLE[Visible dans la liste]
    SET_FEAT --> END([Fin])
    VISIBLE --> END
```

---

## 5. Scraping FFVB

```mermaid
flowchart TD
    START([Début — déclenchement manuel]) --> FETCH[Puppeteer — accède à l'URL FFVB]
    FETCH --> PARSE{Page chargée<br/>correctement ?}
    PARSE -->|Non| LOG_ERR[Créer ScrapingLog<br/>status: error]
    LOG_ERR --> END_ERR([Fin — erreur])
    PARSE -->|Oui| EXTRACT[Cheerio — extraire HTML]
    EXTRACT --> MAP[Mapper vers objets JS<br/>standings + matches]
    MAP --> UPSERT_S[Upsert standings<br/>par teamName + championshipId]
    UPSERT_S --> UPSERT_M[Upsert matches<br/>par federationMatchId]
    UPSERT_M --> LOG_OK[Créer ScrapingLog<br/>status: success]
    LOG_OK --> RETURN[Retourner stats<br/>imported / updated]
    RETURN --> END([Fin])
```

---

## 6. Ajout d'un partenaire

```mermaid
flowchart TD
    START([Début]) --> FORM[Remplir formulaire<br/>nom, description, logo, site web]
    FORM --> UPLOAD{Upload logo ?}
    UPLOAD -->|Oui| FILE[POST /api/upload<br/>Récupérer URL]
    FILE --> PRIORITY[Définir la priorité d'affichage]
    UPLOAD -->|Non| PRIORITY
    PRIORITY --> SAVE[POST /api/partners]
    SAVE --> ACTIVE{Activer<br/>immédiatement ?}
    ACTIVE -->|Oui| VISIBLE[isActive: true<br/>Visible sur le site]
    ACTIVE -->|Non| HIDDEN[isActive: false<br/>Non visible]
    VISIBLE --> END([Fin])
    HIDDEN --> END
```

---

## 7. Navigation visiteur — Consultation équipes

```mermaid
flowchart TD
    START([Début]) --> HOME[Page d'accueil]
    HOME --> TEAMS[Liste des équipes<br/>saison active]
    TEAMS --> FILTER{Filtrer ?}
    FILTER -->|Par catégorie| CAT[Jeunes / Séniors / Loisirs]
    FILTER -->|Par saison| SEASON[Sélectionner saison]
    FILTER -->|Non| DETAIL
    CAT --> DETAIL[Fiche équipe]
    SEASON --> DETAIL
    DETAIL --> SECTION{Consulter ?}
    SECTION -->|Effectif| MEMBERS[Liste des membres]
    SECTION -->|Classement| CLASS[Tableau de classement FFVB]
    SECTION -->|Matchs| MATCHES[Calendrier et résultats]
    MEMBERS --> END([Fin])
    CLASS --> END
    MATCHES --> END
```
