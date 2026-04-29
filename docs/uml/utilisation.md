# UML — Diagrammes de cas d'utilisation

---

## Acteurs

| Acteur | Rôle |
|---|---|
| **Visiteur** | Tout internaute — accès au site public uniquement |
| **Administrateur** | Gestion complète via le back-office |
| **Éditeur** | Gestion des contenus (actualités, médias) |
| **Système FFVB** | Source de données sportives externes |

---

## Cas d'utilisation — Visiteur (site public)

```mermaid
graph LR
    V((Visiteur))
    V --> UC1[Consulter la page d'accueil]
    V --> UC2[Voir les équipes par saison]
    V --> UC3[Consulter la fiche d'une équipe]
    V --> UC4[Voir l'effectif et le staff]
    V --> UC5[Consulter le classement FFVB]
    V --> UC6[Voir les matchs et résultats]
    V --> UC7[Consulter les actualités]
    V --> UC8[Voir la galerie photos]
    V --> UC9[Consulter les partenaires]
    V --> UC10[Voir les archives par saison]
    V --> UC11[Utiliser le formulaire de contact]
    V --> UC12[Accéder aux informations pratiques]
```

---

## Cas d'utilisation — Administrateur (back-office)

### Gestion du club

```mermaid
graph LR
    A((Admin))
    A --> UC1[Modifier les informations du club]
    A --> UC2[Mettre à jour le logo et la photo]
    A --> UC3[Gérer les réseaux sociaux]
    A --> UC4[Modifier les mentions légales]
    A --> UC5[Gérer les informations de contact]
```

### Gestion sportive

```mermaid
graph LR
    A((Admin))
    A --> UC1[Créer / modifier / supprimer une saison]
    A --> UC2[Créer / modifier / supprimer une équipe]
    A --> UC3[Archiver une équipe]
    UC2 --> UC3
    A --> UC4[Dupliquer une équipe pour une nouvelle saison]
    UC3 --> UC4
    A --> UC5[Ajouter / modifier / supprimer un membre]
    A --> UC6[Associer un membre à une équipe]
    A --> UC7[Lier une équipe à un championnat FFVB]
```

### Gestion des contenus

```mermaid
graph LR
    A((Admin))
    ED((Éditeur))
    A --> UC1[Créer / modifier / supprimer une actualité]
    ED --> UC1
    A --> UC2[Publier / dépublier une actualité]
    ED --> UC2
    A --> UC3[Mettre une actualité à la une]
    A --> UC4[Créer / gérer des albums photos]
    ED --> UC4
    A --> UC5[Ajouter / supprimer des médias]
    ED --> UC5
    A --> UC6[Gérer les partenaires]
```

### Supervision et utilisateurs

```mermaid
graph LR
    A((Admin))
    FFVB((Système FFVB))

    A --> UC1[Lancer le scraping FFVB]
    FFVB --> UC1
    UC1 --> UC2[Importer classements et matchs]
    A --> UC3[Consulter les logs de scraping]
    A --> UC4[Gérer les utilisateurs]
    A --> UC5[Activer / désactiver un compte]
    A --> UC6[Modifier le rôle d'un utilisateur]
```

---

## PlantUML — Source diagramme visiteur

Les images dans [./images/](./images/) ont été générées avec PlantUML.

```plantuml
@startuml
title Pages publiques - Club de Volley SB d'Anjou

actor Visiteur

package "Accueil & Informations" {
  (Consulter la page d'accueil)
  (Voir les informations pratiques)
  (Utiliser le formulaire de contact)
}

package "Équipes & Joueurs" {
  (Consulter la liste des équipes)
  (Voir les détails d'une équipe)
  (Consulter la fiche d'un membre)
  (Filtrer par catégorie ou saison)
}

package "Actualités & Médias" {
  (Consulter les actualités)
  (Voir la galerie photos)
  (Consulter les archives par saison)
}

package "Résultats FFVB" {
  (Voir le classement d'une équipe)
  (Consulter les matchs et résultats)
}

package "Partenaires" {
  (Voir la liste des partenaires)
  (Consulter la fiche d'un partenaire)
}

Visiteur --> (Consulter la page d'accueil)
Visiteur --> (Voir les informations pratiques)
Visiteur --> (Utiliser le formulaire de contact)
Visiteur --> (Consulter la liste des équipes)
Visiteur --> (Voir les détails d'une équipe)
Visiteur --> (Consulter la fiche d'un membre)
Visiteur --> (Filtrer par catégorie ou saison)
Visiteur --> (Consulter les actualités)
Visiteur --> (Voir la galerie photos)
Visiteur --> (Consulter les archives par saison)
Visiteur --> (Voir le classement d'une équipe)
Visiteur --> (Consulter les matchs et résultats)
Visiteur --> (Voir la liste des partenaires)
Visiteur --> (Consulter la fiche d'un partenaire)

@enduml
```

---

## PlantUML — Source diagramme back-office (Équipes/Saisons)

```plantuml
@startuml
title Gestion Équipes / Saisons - Back-office

actor Administrateur

package "Connexion" {
  (Se connecter au back-office)
}

package "Gestion des saisons" {
  (Créer et configurer une nouvelle saison)
  (Archiver une saison)
}

package "Gestion des équipes" {
  (Créer, modifier ou supprimer une équipe)
  (Archiver une équipe) <<extend>>
  (Dupliquer une équipe pour la nouvelle saison) <<extend>>
  (Lier à un championnat FFVB)
}

package "Gestion des membres" {
  (Ajouter, modifier ou supprimer un membre)
  (Associer un membre à une équipe)
}

Administrateur --> (Se connecter au back-office)
Administrateur --> (Créer et configurer une nouvelle saison)
Administrateur --> (Créer, modifier ou supprimer une équipe)
Administrateur --> (Ajouter, modifier ou supprimer un membre)

(Créer, modifier ou supprimer une équipe) ..> (Archiver une équipe) : <<extend>>
(Archiver une équipe) ..> (Dupliquer une équipe pour la nouvelle saison) : <<extend>>
(Créer, modifier ou supprimer une équipe) --> (Lier à un championnat FFVB)

@enduml
```
