# MPD — Modèle Physique de Données

> Schémas physiques — MongoDB (JSON) et équivalent SQL

---

## MongoDB — Schémas des collections

### users
```json
{
  "_id": "ObjectId",
  "email": "string",
  "passwordHash": "string",
  "role": "admin | editor | user",
  "firstName": "string",
  "lastName": "string",
  "isActive": true,
  "isVerified": false,
  "lastLoginAt": "ISODate | null",
  "passwordUpdatedAt": "ISODate | null",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
Index : `{ email: 1 }` unique

---

### clubs
```json
{
  "_id": "ObjectId",
  "name": "string",
  "subtitle": "string",
  "homeDescription": "string",
  "clubDescription": "string",
  "ownerDescription": "string",
  "logo": "string",
  "photo": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "social_links": {
    "facebook": "string",
    "instagram": "string",
    "youtube": "string",
    "sporteasy": "string",
    "clubMerch": "string",
    "clubRegistration": "string",
    "website": "string",
    "other": "string"
  },
  "legal_info": {
    "associationName": "string",
    "legalForm": "string",
    "siret": "string",
    "rna": "string",
    "headOffice": "string",
    "publicationDate": "ISODate | null",
    "responsible": "string",
    "hostingProvider": "string",
    "updatedAt": "ISODate | null"
  },
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
> Collection singleton — un seul document représente le club.

---

### seasons
```json
{
  "_id": "ObjectId",
  "name": "string",
  "startDate": "ISODate",
  "endDate": "ISODate",
  "status": "active | archived | future",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

### teams
```json
{
  "_id": "ObjectId",
  "name": "string",
  "category": "string",
  "gender": "Masculin | Féminin | Mixte",
  "level": "string",
  "seasonId": "ObjectId",
  "trainingSchedule": "string",
  "coachIds": ["ObjectId"],
  "photo": "string",
  "ffvbTeamCode": "string",
  "isArchived": false,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
Index : `{ seasonId: 1 }`, `{ isArchived: 1 }`

---

### members
```json
{
  "_id": "ObjectId",
  "firstName": "string",
  "lastName": "string",
  "type": "player | staff | dirigeant | benevole",
  "role": "string",
  "teamId": "ObjectId",
  "seasonId": "ObjectId",
  "birthDate": "ISODate | null",
  "position": "string",
  "height": "Number",
  "weight": "Number",
  "photo": "string",
  "bio": "string",
  "isActive": true,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
Index : `{ teamId: 1 }`, `{ seasonId: 1 }`

---

### news
```json
{
  "_id": "ObjectId",
  "title": "string",
  "slug": "string",
  "content": "string",
  "albumId": "ObjectId | null",
  "authorId": "ObjectId",
  "isPublished": false,
  "isFeatured": false,
  "publishedAt": "ISODate | null",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
Index : `{ slug: 1 }` unique, `{ isPublished: 1, isFeatured: 1 }`

---

### albums
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "eventDate": "ISODate | null",
  "isPublic": true,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

### media
```json
{
  "_id": "ObjectId",
  "albumId": "ObjectId",
  "url": "string",
  "type": "photo | video",
  "order": "Number",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
Index : `{ albumId: 1, order: 1 }`

---

### partners
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "logo": "string",
  "website": "string",
  "priority": "Number",
  "isActive": true,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
Index : `{ priority: -1, isActive: 1 }`

---

### championships
```json
{
  "_id": "ObjectId",
  "seasonId": "ObjectId",
  "teamId": "ObjectId",
  "federationUrl": "string",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
Index : `{ teamId: 1, seasonId: 1 }` unique

---

### standings
```json
{
  "_id": "ObjectId",
  "championshipId": "ObjectId",
  "teamName": "string",
  "rank": "Number",
  "points": "Number",
  "played": "Number",
  "wins": "Number",
  "losses": "Number",
  "setsFor": "Number",
  "setsAgainst": "Number",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
Index : `{ championshipId: 1, teamName: 1 }` unique

---

### matches
```json
{
  "_id": "ObjectId",
  "championshipId": "ObjectId",
  "federationMatchId": "string",
  "opponentName": "string",
  "date": "ISODate",
  "homeAway": "home | away",
  "status": "scheduled | played",
  "scoreFor": "Number | null",
  "scoreAgainst": "Number | null",
  "setsDetail": "string",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
Index : `{ federationMatchId: 1 }` unique, `{ championshipId: 1, date: 1 }`

---

### scrapinglogs
```json
{
  "_id": "ObjectId",
  "seasonId": "ObjectId",
  "source": "string",
  "status": "success | error",
  "message": "string",
  "runAt": "ISODate",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
Index : `{ seasonId: 1, runAt: -1 }`

---

## SQL — Équivalent relationnel (référence)

> Ce projet utilise MongoDB. Le schéma SQL ci-dessous est fourni à titre documentaire.

```sql
-- UTILISATEURS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK(role IN ('admin', 'editor', 'user')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    password_updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CLUBS
CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    home_description TEXT,
    club_description TEXT,
    owner_description TEXT,
    logo TEXT,
    photo TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE social_links (
    id SERIAL PRIMARY KEY,
    club_id INT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    facebook TEXT,
    instagram TEXT,
    youtube TEXT,
    sporteasy TEXT,
    club_merch TEXT,
    club_registration TEXT,
    website TEXT,
    other TEXT
);

CREATE TABLE legal_info (
    id SERIAL PRIMARY KEY,
    club_id INT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    association_name VARCHAR(255),
    legal_form VARCHAR(50),
    siret VARCHAR(20),
    rna VARCHAR(20),
    head_office TEXT,
    publication_date DATE,
    responsible VARCHAR(255),
    hosting_provider VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SAISONS
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK(status IN ('active', 'archived', 'future')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ÉQUIPES
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    gender VARCHAR(20),
    level VARCHAR(50),
    season_id INT NOT NULL REFERENCES seasons(id),
    training_schedule TEXT,
    photo TEXT,
    ffvb_team_code VARCHAR(50),
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- MEMBRES
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK(type IN ('player','staff','dirigeant','benevole')),
    role VARCHAR(100),
    team_id INT REFERENCES teams(id),
    season_id INT REFERENCES seasons(id),
    birth_date DATE,
    position VARCHAR(50),
    height NUMERIC(5,2),
    weight NUMERIC(5,2),
    photo TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ACTUALITÉS
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    content TEXT,
    album_id INT REFERENCES albums(id),
    author_id INT REFERENCES users(id),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ALBUMS & MÉDIAS
CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    event_date DATE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    album_id INT REFERENCES albums(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type VARCHAR(20) CHECK(type IN ('photo','video')),
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PARTENAIRES
CREATE TABLE partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    logo TEXT,
    website TEXT,
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CHAMPIONNATS FFVB
CREATE TABLE championships (
    id SERIAL PRIMARY KEY,
    season_id INT REFERENCES seasons(id),
    team_id INT REFERENCES teams(id),
    federation_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(season_id, team_id)
);

CREATE TABLE standings (
    id SERIAL PRIMARY KEY,
    championship_id INT REFERENCES championships(id),
    team_name VARCHAR(255),
    rank INT,
    points INT,
    played INT,
    wins INT,
    losses INT,
    sets_for INT,
    sets_against INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    championship_id INT REFERENCES championships(id),
    federation_match_id VARCHAR(50) UNIQUE,
    opponent_name VARCHAR(255),
    date TIMESTAMP,
    home_away VARCHAR(10) CHECK(home_away IN ('home','away')),
    status VARCHAR(20) CHECK(status IN ('scheduled','played')),
    score_for INT,
    score_against INT,
    sets_detail TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- LOGS SCRAPING
CREATE TABLE scraping_logs (
    id SERIAL PRIMARY KEY,
    season_id INT REFERENCES seasons(id),
    source VARCHAR(50),
    status VARCHAR(20) CHECK(status IN ('success','error')),
    message TEXT,
    run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```
