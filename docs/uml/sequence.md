# UML — Diagrammes de séquence

---

## 1. Authentification — Connexion administrateur

```mermaid
sequenceDiagram
    actor Admin
    participant F as Frontend (Next.js)
    participant B as Backend (Express)
    participant DB as MongoDB

    Admin->>F: Saisit email + mot de passe
    F->>B: POST /api/auth/login
    B->>DB: User.findOne({ email })
    DB-->>B: Document User
    B->>B: bcrypt.compare(password, hash)
    alt Identifiants valides
        B->>B: jwt.sign({ userId, role })
        B-->>F: 200 + Set-Cookie: jwt (httpOnly)
        F-->>Admin: Redirection /admin
    else Identifiants invalides
        B-->>F: 401 Unauthorized
        F-->>Admin: Message d'erreur
    end
```

---

## 2. Authentification — Vérification de session

```mermaid
sequenceDiagram
    actor User
    participant MW as Middleware Next.js
    participant B as Backend (Express)

    User->>MW: Accès à /admin/*
    MW->>B: GET /api/auth/me (cookie JWT auto)
    alt JWT valide
        B-->>MW: 200 { user, role: "admin" }
        MW-->>User: Page admin rendue
    else JWT invalide / expiré
        B-->>MW: 401
        MW-->>User: Redirection /login
    end
```

---

## 3. Inscription utilisateur

```mermaid
sequenceDiagram
    actor User
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    participant MAIL as Service email

    User->>F: Remplit formulaire inscription
    F->>F: Valide mot de passe (regex)
    F->>B: POST /api/auth/register
    B->>DB: Vérifie email existant
    alt Email déjà utilisé
        B-->>F: 409 Conflict
    else Nouveau compte
        B->>DB: Crée User (isActive: false, isVerified: false)
        B->>MAIL: Envoie email de vérification
        B-->>F: 201 { message }
        F-->>User: "Vérifiez votre email"
    end
```

---

## 4. Scraping FFVB

```mermaid
sequenceDiagram
    actor Admin
    participant F as Frontend
    participant B as Backend
    participant PUP as Puppeteer
    participant FFVB as Site FFVB
    participant DB as MongoDB

    Admin->>F: Clique "Lancer le scraping"
    F->>B: POST /api/scraping/run
    B->>B: Vérifie rôle admin
    B->>PUP: Lance navigateur headless
    PUP->>FFVB: Accède à l'URL FFVB
    FFVB-->>PUP: HTML de la page
    PUP->>B: Retourne HTML parsé
    B->>B: Cheerio — extrait classements + matchs
    B->>DB: Upsert standings (par teamName + championshipId)
    B->>DB: Upsert matches (par federationMatchId)
    B->>DB: Crée ScrapingLog (status: success)
    B-->>F: 200 { imported, updated }
    F-->>Admin: Affiche résultats
```

---

## 5. Gestion d'une saison — Création et archivage

```mermaid
sequenceDiagram
    actor Admin
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB

    Admin->>F: Crée nouvelle saison (nom, dates)
    F->>B: POST /api/seasons
    B->>DB: Crée Season { status: "active" }
    DB-->>B: Season créée
    B-->>F: 201 Season

    Admin->>F: Crée équipes pour la saison
    F->>B: POST /api/teams { seasonId }
    B->>DB: Crée Team { seasonId, isArchived: false }

    Note over Admin,DB: En fin de saison

    Admin->>F: Archive la saison
    F->>B: PATCH /api/seasons/:id { status: "archived" }
    B->>DB: Met à jour Season.status = "archived"
    B-->>F: 200 OK
```

---

## 6. Publication d'une actualité

```mermaid
sequenceDiagram
    actor Editor
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB

    Editor->>F: Rédige actualité (titre, contenu)
    F->>B: POST /api/news { isPublished: false }
    B->>DB: Crée News (brouillon)
    DB-->>B: News créée
    B-->>F: 201 News

    Editor->>F: Clique "Publier"
    F->>B: PATCH /api/news/:id { isPublished: true, publishedAt: now }
    B->>DB: Met à jour News
    B-->>F: 200 OK
    F-->>Editor: Actualité visible sur le site

    opt Mise à la une
        Editor->>F: Active "À la une"
        F->>B: PATCH /api/news/:id { isFeatured: true }
        B->>DB: Met à jour News
    end
```

---

## 7. Upload d'un fichier (logo / photo)

```mermaid
sequenceDiagram
    actor Admin
    participant F as Frontend
    participant B as Backend
    participant FS as Système de fichiers

    Admin->>F: Sélectionne un fichier
    F->>F: Prépare FormData { file, oldFile? }
    F->>B: POST /api/upload (multipart/form-data)
    B->>B: Multer reçoit le fichier
    opt Ancien fichier existant
        B->>FS: Supprime l'ancien fichier
    end
    B->>FS: Enregistre nouveau fichier dans /uploads
    B-->>F: 200 { filename }
    F->>F: Construit URL = API_URL + /uploads/ + filename
    F-->>Admin: Prévisualise la nouvelle image
```
