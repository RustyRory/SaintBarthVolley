# UML — Diagramme de classes

---

## Vue d'ensemble des classes

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String email
        +String passwordHash
        +String role
        +String firstName
        +String lastName
        +Boolean isActive
        +Boolean isVerified
        +Date lastLoginAt
        +Date passwordUpdatedAt
        +Date createdAt
        +Date updatedAt
        +setPassword(password) void
        +comparePassword(password) Boolean
    }

    class Club {
        +ObjectId _id
        +String name
        +String subtitle
        +String homeDescription
        +String clubDescription
        +String ownerDescription
        +String logo
        +String photo
        +String email
        +String phone
        +String address
        +SocialLink social_links
        +LegalInfo legal_info
        +Date createdAt
        +Date updatedAt
    }

    class SocialLink {
        +String facebook
        +String instagram
        +String youtube
        +String sporteasy
        +String clubMerch
        +String clubRegistration
        +String website
        +String other
    }

    class LegalInfo {
        +String associationName
        +String legalForm
        +String siret
        +String rna
        +String headOffice
        +Date publicationDate
        +String responsible
        +String hostingProvider
        +Date updatedAt
    }

    class Season {
        +ObjectId _id
        +String name
        +Date startDate
        +Date endDate
        +String status
        +Date createdAt
        +Date updatedAt
        +archive() void
    }

    class Team {
        +ObjectId _id
        +String name
        +String category
        +String gender
        +String level
        +ObjectId seasonId
        +String trainingSchedule
        +ObjectId[] coachIds
        +String photo
        +String ffvbTeamCode
        +Boolean isArchived
        +Date createdAt
        +Date updatedAt
        +archive() void
        +duplicate() Team
    }

    class Member {
        +ObjectId _id
        +String firstName
        +String lastName
        +String type
        +String role
        +ObjectId teamId
        +ObjectId seasonId
        +Date birthDate
        +String position
        +Number height
        +Number weight
        +String photo
        +String bio
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
    }

    class News {
        +ObjectId _id
        +String title
        +String slug
        +String content
        +ObjectId albumId
        +ObjectId authorId
        +Boolean isPublished
        +Boolean isFeatured
        +Date publishedAt
        +Date createdAt
        +Date updatedAt
        +publish() void
    }

    class Album {
        +ObjectId _id
        +String title
        +String description
        +Date eventDate
        +Boolean isPublic
        +Date createdAt
        +Date updatedAt
    }

    class Media {
        +ObjectId _id
        +ObjectId albumId
        +String url
        +String type
        +Number order
        +Date createdAt
        +Date updatedAt
    }

    class Partner {
        +ObjectId _id
        +String name
        +String description
        +String logo
        +String website
        +Number priority
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
    }

    class Championship {
        +ObjectId _id
        +ObjectId seasonId
        +ObjectId teamId
        +String federationUrl
        +Date createdAt
        +Date updatedAt
    }

    class Standing {
        +ObjectId _id
        +ObjectId championshipId
        +String teamName
        +Number rank
        +Number points
        +Number played
        +Number wins
        +Number losses
        +Number setsFor
        +Number setsAgainst
        +Date createdAt
        +Date updatedAt
    }

    class Match {
        +ObjectId _id
        +ObjectId championshipId
        +String federationMatchId
        +String opponentName
        +Date date
        +String homeAway
        +String status
        +Number scoreFor
        +Number scoreAgainst
        +String setsDetail
        +Date createdAt
        +Date updatedAt
    }

    class ScrapingLog {
        +ObjectId _id
        +ObjectId seasonId
        +String source
        +String status
        +String message
        +Date runAt
        +Date createdAt
        +Date updatedAt
    }

    %% Compositions (objets embarqués)
    Club *-- SocialLink : social_links
    Club *-- LegalInfo : legal_info

    %% Relations référencées
    Season "1" --> "0..*" Team : seasonId
    Season "1" --> "0..*" Member : seasonId
    Season "1" --> "0..*" ScrapingLog : seasonId
    Team "1" --> "0..*" Member : teamId
    Team "1" --> "0..1" Championship : teamId
    Championship "1" --> "1..*" Standing : championshipId
    Championship "1" --> "0..*" Match : championshipId
    User "1" --> "0..*" News : authorId
    News "0..1" --> "0..1" Album : albumId
    Album "1" --> "1..*" Media : albumId
```

---

## Relations clés

| Relation | Type | Cardinalité |
|---|---|---|
| `Club` ◆─ `SocialLink` | Composition (embedded) | 1 — 1 |
| `Club` ◆─ `LegalInfo` | Composition (embedded) | 1 — 1 |
| `Season` → `Team` | Référence (seasonId) | 1 — 0..* |
| `Season` → `Member` | Référence (seasonId) | 1 — 0..* |
| `Team` → `Member` | Référence (teamId) | 1 — 0..* |
| `Team` → `Championship` | Référence (teamId) | 1 — 0..1 |
| `Championship` → `Standing` | Référence (championshipId) | 1 — 1..* |
| `Championship` → `Match` | Référence (championshipId) | 1 — 0..* |
| `User` → `News` | Référence (authorId) | 1 — 0..* |
| `News` → `Album` | Référence optionnelle (albumId) | 0..1 — 0..1 |
| `Album` → `Media` | Référence (albumId) | 1 — 1..* |
| `Season` → `ScrapingLog` | Référence (seasonId) | 1 — 0..* |

---

## Énumérations

### User.role
- `admin` — accès complet
- `editor` — gestion des contenus
- `user` — compte standard (non utilisé en back-office)

### Season.status
- `active` — saison en cours
- `archived` — saison terminée
- `future` — saison à venir

### Member.type
- `player` — joueur
- `staff` — entraîneur / encadrement
- `dirigeant` — dirigeant du club
- `benevole` — bénévole

### Match.homeAway
- `home` — à domicile
- `away` — à l'extérieur

### Match.status
- `scheduled` — match à venir
- `played` — match joué

---

## PlantUML — Source (pour génération PNG)

```plantuml
@startuml
title Diagramme de classes — Club de Volley SB d'Anjou

class User {
  _id: ObjectId
  email: String
  passwordHash: String
  role: String
  firstName: String
  lastName: String
  isActive: Boolean
  isVerified: Boolean
  lastLoginAt: Date
  passwordUpdatedAt: Date
  createdAt: Date
  updatedAt: Date
  setPassword()
  comparePassword()
}

class Club {
  _id: ObjectId
  name: String
  subtitle: String
  homeDescription: Text
  clubDescription: Text
  ownerDescription: Text
  logo: String
  photo: String
  email: String
  phone: String
  address: String
  createdAt: Date
  updatedAt: Date
}

class SocialLink {
  facebook: String
  instagram: String
  youtube: String
  sporteasy: String
  website: String
  other: String
}

class LegalInfo {
  associationName: String
  legalForm: String
  siret: String
  rna: String
  headOffice: String
  publicationDate: Date
  responsible: String
  hostingProvider: String
  updatedAt: Date
}

class Season {
  _id: ObjectId
  name: String
  startDate: Date
  endDate: Date
  status: String
  archive()
}

class Team {
  _id: ObjectId
  name: String
  category: String
  gender: String
  level: String
  trainingSchedule: String
  ffvbTeamCode: String
  isArchived: Boolean
  archive()
  duplicate()
}

class Member {
  _id: ObjectId
  firstName: String
  lastName: String
  type: String
  role: String
  birthDate: Date
  position: String
  height: Number
  weight: Number
  isActive: Boolean
}

class News {
  _id: ObjectId
  title: String
  slug: String
  content: Text
  isPublished: Boolean
  isFeatured: Boolean
  publishedAt: Date
  publish()
}

class Album {
  _id: ObjectId
  title: String
  description: String
  eventDate: Date
  isPublic: Boolean
}

class Media {
  _id: ObjectId
  url: String
  type: String
  order: Number
}

class Partner {
  _id: ObjectId
  name: String
  logo: String
  website: String
  priority: Number
  isActive: Boolean
}

class Championship {
  _id: ObjectId
  federationUrl: String
}

class Standing {
  _id: ObjectId
  teamName: String
  rank: Number
  points: Number
  played: Number
  wins: Number
  losses: Number
  setsFor: Number
  setsAgainst: Number
}

class Match {
  _id: ObjectId
  federationMatchId: String
  opponentName: String
  date: Date
  homeAway: String
  status: String
  scoreFor: Number
  scoreAgainst: Number
}

class ScrapingLog {
  _id: ObjectId
  source: String
  status: String
  message: String
  runAt: Date
}

Club *-- SocialLink
Club *-- LegalInfo

Season "1" -- "*" Team
Season "1" -- "*" Member
Team "1" -- "*" Member
Team "1" -- "0..1" Championship

Championship "1" -- "*" Standing
Championship "1" -- "*" Match
Season "1" -- "*" ScrapingLog

User "1" -- "*" News
News "0..1" -- "0..1" Album
Album "1" -- "*" Media

@enduml
```
