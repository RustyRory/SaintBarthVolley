# MLD

## json

```json
// ======================================
// USERS
// ======================================
{
  "_id": ObjectId,
  "email": "string",                // unique
  "passwordHash": "string",
  "role": "admin | editor",
  "firstName": "string",
  "lastName": "string",
  "isActive": true,
  "lastLoginAt": ISODate,
  "passwordUpdatedAt": ISODate,
  "createdAt": ISODate,
  "updatedAt": ISODate
}

// ======================================
// CLUBS
// ======================================
{
  "_id": ObjectId,
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
  "socialLinks": {                  // embedded document
    "facebook": "string",
    "instagram": "string",
    "youtube": "string",
    "sporteasy": "string",
    "website": "string",
    "other": "string"
  },
  "legalInfo": {                    // embedded document
    "associationName": "string",
    "legalForm": "string",
    "siret": "string",
    "rna": "string",
    "headOffice": "string",
    "publicationDate": ISODate,
    "responsible": "string",
    "hostingProvider": "string",
    "updatedAt": ISODate
  },
  "createdAt": ISODate,
  "updatedAt": ISODate
}

// ======================================
// SEASONS
// ======================================
{
  "_id": ObjectId,
  "name": "string",
  "startDate": ISODate,
  "endDate": ISODate,
  "status": "active | archived | future",
  "createdAt": ISODate,
  "updatedAt": ISODate
}

// ======================================
// TEAMS
// ======================================
{
  "_id": ObjectId,
  "name": "string",
  "category": "string",
  "gender": "Masculin | Féminin | Mixte",
  "level": "string",
  "seasonId": ObjectId,             // référence à seasons
  "trainingSchedule": "string",
  "coachIds": [ObjectId],           // références membres
  "photo": "string",
  "ffvbTeamCode": "string",
  "isArchived": false,
  "clubId": ObjectId,               // référence à club
  "createdAt": ISODate,
  "updatedAt": ISODate
}

// ======================================
// MEMBERS
// ======================================
{
  "_id": ObjectId,
  "firstName": "string",
  "lastName": "string",
  "type": "player | staff | dirigeant | benevole",
  "role": "string",
  "teamId": ObjectId,               // référence équipe
  "seasonId": ObjectId,             // référence saison
  "birthDate": ISODate,
  "position": "string",
  "height": Number,
  "weight": Number,
  "photo": "string",
  "bio": "string",
  "isActive": true,
  "createdAt": ISODate,
  "updatedAt": ISODate
}

// ======================================
// NEWS
// ======================================
{
  "_id": ObjectId,
  "title": "string",
  "slug": "string",
  "content": "string",
  "albumId": ObjectId,             // référence album
  "authorId": ObjectId,            // référence user
  "isPublished": false,
  "isFeatured": false,
  "publishedAt": ISODate,
  "createdAt": ISODate,
  "updatedAt": ISODate
}

// ======================================
// ALBUMS
// ======================================
{
  "_id": ObjectId,
  "title": "string",
  "description": "string",
  "eventDate": ISODate,
  "isPublic": true,
  "createdAt": ISODate,
  "updatedAt": ISODate
}

// ======================================
// MEDIA
// ======================================
{
  "_id": ObjectId,
  "albumId": ObjectId,              // référence album
  "url": "string",
  "type": "photo | video",
  "order": Number,
  "createdAt": ISODate,
  "updatedAt": ISODate
}

// ======================================
// PARTNERS
// ======================================
{
  "_id": ObjectId,
  "name": "string",
  "description": "string",
  "logo": "string",
  "website": "string",
  "priority": Number,
  "isActive": true,
  "clubId": ObjectId,
  "createdAt": ISODate,
  "updatedAt": ISODate
}

// ======================================
// CHAMPIONSHIPS FFVB
// ======================================
{
  "_id": ObjectId,
  "seasonId": ObjectId,
  "teamId": ObjectId,
  "federationUrl": "string",
  "createdAt": ISODate,
  "updatedAt": ISODate
}

// ======================================
// STANDINGS FFVB
// ======================================
{
  "_id": ObjectId,
  "championshipId": ObjectId,
  "teamName": "string",
  "rank": Number,
  "points": Number,
  "played": Number,
  "wins": Number,
  "losses": Number,
  "setsFor": Number,
  "setsAgainst": Number,
  "createdAt": ISODate,
  "updatedAt": ISODate
}

// ======================================
// MATCHES FFVB
// ======================================
{
  "_id": ObjectId,
  "federationMatchId": "string",
  "championshipId": ObjectId,
  "opponentName": "string",
  "date": ISODate,
  "homeAway": "home | away",
  "status": "scheduled | played",
  "scoreFor": Number,
  "scoreAgainst": Number,
  "setsDetail": "string",
  "createdAt": ISODate,
  "updatedAt": ISODate
}

// ======================================
// SCRAPING LOGS
// ======================================
{
  "_id": ObjectId,
  "source": "string",
  "seasonId": ObjectId,
  "status": "success | error",
  "message": "string",
  "runAt": ISODate,
  "createdAt": ISODate,
  "updatedAt": ISODate
}

```

## SQL

```sql
-- ======================================
-- UTILISATEURS
-- ======================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK(role IN ('admin', 'editor')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    password_updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ======================================
-- CLUBS
-- ======================================
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

-- Réseaux sociaux (JSON pour flexibilité)
CREATE TABLE social_links (
    id SERIAL PRIMARY KEY,
    club_id INT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    facebook TEXT,
    instagram TEXT,
    youtube TEXT,
    sporteasy TEXT,
    website TEXT,
    other TEXT
);

-- Informations légales
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

-- ======================================
-- SAISONS
-- ======================================
CREATE TABLE seasons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK(status IN ('active', 'archived', 'future')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ======================================
-- ÉQUIPES
-- ======================================
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    gender VARCHAR(20),
    level VARCHAR(50),
    season_id INT NOT NULL REFERENCES seasons(id),
    training_schedule TEXT,
    coach_ids INT[], -- tableau des membres coach
    photo TEXT,
    ffvb_team_code VARCHAR(50),
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    club_id INT REFERENCES clubs(id)
);

-- ======================================
-- MEMBRES
-- ======================================
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

-- Table de liaison équipe ↔ membre
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    member_id INT REFERENCES members(id) ON DELETE CASCADE,
    role_in_team VARCHAR(100)
);

-- ======================================
-- ACTUALITÉS
-- ======================================
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    content TEXT,
    album_id INT REFERENCES album(id),
    author_id INT REFERENCES users(id),
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ======================================
-- ALBUMS & MÉDIAS
-- ======================================
CREATE TABLE album (
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
    album_id INT REFERENCES album(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type VARCHAR(20) CHECK(type IN ('photo','video')),
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table pour relier actualités ↔ albums
CREATE TABLE news_albums (
    id SERIAL PRIMARY KEY,
    news_id INT REFERENCES news(id) ON DELETE CASCADE,
    album_id INT REFERENCES album(id) ON DELETE CASCADE
);

-- ======================================
-- PARTENAIRES
-- ======================================
CREATE TABLE partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    logo TEXT,
    website TEXT,
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    club_id INT REFERENCES clubs(id)
);

-- ======================================
-- CHAMPIONNATS FFVB
-- ======================================
CREATE TABLE championships_ffvb (
    id SERIAL PRIMARY KEY,
    season_id INT REFERENCES seasons(id),
    team_id INT REFERENCES teams(id),
    federation_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE standings_ffvb (
    id SERIAL PRIMARY KEY,
    championship_id INT REFERENCES championships_ffvb(id),
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

CREATE TABLE matches_ffvb (
    id SERIAL PRIMARY KEY,
    federation_match_id VARCHAR(50),
    championship_id INT REFERENCES championships_ffvb(id),
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

-- ======================================
-- SCRAPING LOGS
-- ======================================
CREATE TABLE scraping_logs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50),
    season_id INT REFERENCES seasons(id),
    status VARCHAR(20) CHECK(status IN ('success','error')),
    message TEXT,
    run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

