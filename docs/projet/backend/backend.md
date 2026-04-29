# Backend — Architecture et API REST

> Node.js + Express + MongoDB + Mongoose

---

## Stack

| Technologie | Rôle |
|---|---|
| Node.js 20 | Runtime JavaScript |
| Express 4 | Framework HTTP |
| MongoDB | Base de données NoSQL |
| Mongoose | ODM (Object Document Mapper) |
| bcrypt | Hash des mots de passe |
| JWT | Authentification par token |
| dotenv | Variables d'environnement |
| cors | Politique CORS |
| multer | Upload de fichiers |
| Puppeteer + Cheerio | Scraping FFVB |

---

## Structure du projet

```
backend/
├── server.js                   ← Point d'entrée
├── src/
│   ├── app.js                  ← Configuration Express
│   ├── routes/                 ← Définition des routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── club.js
│   │   ├── seasons.js
│   │   ├── teams.js
│   │   ├── members.js
│   │   ├── news.js
│   │   ├── partners.js
│   │   ├── championships.js
│   │   ├── scraping.js
│   │   └── upload.js
│   ├── controllers/            ← Logique métier
│   ├── models/                 ← Schémas Mongoose
│   │   ├── User.js
│   │   ├── Club.js
│   │   ├── Season.js
│   │   ├── Team.js
│   │   ├── Member.js
│   │   ├── News.js
│   │   ├── Album.js
│   │   ├── Media.js
│   │   ├── Partner.js
│   │   ├── Championship.js
│   │   ├── Standing.js
│   │   ├── Match.js
│   │   └── ScrapingLog.js
│   ├── middlewares/
│   │   ├── authMiddleware.js   ← Vérification JWT
│   │   └── requireRole.js      ← Vérification rôle
│   └── scripts/
│       └── seeds/
│           ├── seedAdmin.js
│           └── seedClub.js
└── public/
    └── uploads/                ← Fichiers uploadés (volume Docker)
```

---

## Variables d'environnement

```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/saintbarthvolley
JWT_SECRET=...
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=...
EMAIL_HOST=...
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
```

---

## API REST — Référence

### Authentification `/api/auth`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Inscription |
| POST | `/api/auth/login` | — | Connexion |
| POST | `/api/auth/logout` | Cookie | Déconnexion |
| GET | `/api/auth/me` | Cookie | Utilisateur courant |
| GET | `/api/auth/verify-email?token=` | — | Vérification email |
| POST | `/api/auth/resend-verification` | — | Renvoyer email de vérification |
| POST | `/api/auth/forgot-password` | — | Demande reset mot de passe |
| POST | `/api/auth/reset-password` | — | Réinitialisation mot de passe |

### Utilisateurs `/api/users`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | Liste des utilisateurs |
| GET | `/api/users/:id` | Admin | Détail utilisateur |
| PUT | `/api/users/:id` | Admin | Modifier utilisateur |
| DELETE | `/api/users/:id` | Admin | Supprimer utilisateur |
| PATCH | `/api/users/:id/activate` | Admin | Activer/désactiver |
| PATCH | `/api/users/:id/role` | Admin | Modifier le rôle |

### Club `/api/club`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/club` | — | Informations du club |
| PUT | `/api/club` | Admin | Modifier le club |

### Saisons `/api/seasons`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/seasons` | — | Liste des saisons |
| GET | `/api/seasons/:id` | — | Détail saison |
| POST | `/api/seasons` | Admin | Créer une saison |
| PUT | `/api/seasons/:id` | Admin | Modifier une saison |
| DELETE | `/api/seasons/:id` | Admin | Supprimer une saison |

### Équipes `/api/teams`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/teams` | — | Liste des équipes |
| GET | `/api/teams/:id` | — | Détail équipe |
| POST | `/api/teams` | Admin | Créer une équipe |
| PUT | `/api/teams/:id` | Admin | Modifier une équipe |
| DELETE | `/api/teams/:id` | Admin | Supprimer une équipe |
| PATCH | `/api/teams/:id/archive` | Admin | Archiver une équipe |

### Membres `/api/members`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/members` | — | Liste des membres |
| GET | `/api/members/:id` | — | Détail membre |
| POST | `/api/members` | Admin | Créer un membre |
| PUT | `/api/members/:id` | Admin | Modifier un membre |
| DELETE | `/api/members/:id` | Admin | Supprimer un membre |

### Actualités `/api/news`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/news` | — | Liste des actualités |
| GET | `/api/news/:id` | — | Détail actualité |
| POST | `/api/news` | Admin/Editor | Créer une actualité |
| PUT | `/api/news/:id` | Admin/Editor | Modifier une actualité |
| DELETE | `/api/news/:id` | Admin | Supprimer une actualité |

### Partenaires `/api/partners`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/partners` | — | Liste des partenaires |
| GET | `/api/partners/:id` | — | Détail partenaire |
| POST | `/api/partners` | Admin | Créer un partenaire |
| PUT | `/api/partners/:id` | Admin | Modifier un partenaire |
| DELETE | `/api/partners/:id` | Admin | Supprimer un partenaire |

### Championnats & scraping

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/championships` | — | Liste des championnats |
| POST | `/api/championships` | Admin | Créer un championnat |
| GET | `/api/championships/:id/standings` | — | Classement |
| GET | `/api/championships/:id/matches` | — | Matchs |
| POST | `/api/scraping/run` | Admin | Lancer le scraping |
| GET | `/api/scraping/logs` | Admin | Logs de scraping |

### Upload `/api/upload`

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Admin | Upload fichier (logo, photo) |

---

## Middlewares

### authMiddleware.js

Vérifie la présence et la validité du JWT dans le cookie `token`.

```js
// Usage dans les routes
router.get('/users', authMiddleware, requireRole('admin'), getAllUsers);
```

### requireRole.js

Vérifie que l'utilisateur possède le rôle requis.

```js
requireRole('admin')   // Admin uniquement
requireRole('editor')  // Editor et Admin
```

---

## Scripts

### Seed admin

```bash
docker exec -e ADMIN_EMAIL=admin@example.com \
            -e ADMIN_PASSWORD=MotDePasse123! \
            sbv-api node src/scripts/seeds/seedAdmin.js
```

### Seed club

```bash
docker exec -e MONGO_URI=mongodb://mongo:27017/saintbarthvolley \
            sbv-api node src/scripts/seeds/seedClub.js
```

---

## Lancement en développement

```bash
cd saintBarthVolleyApp/backend
npm install
npm run dev     # nodemon server.js
```

API disponible sur `http://localhost:5000`
