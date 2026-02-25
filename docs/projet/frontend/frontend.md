# Frontend – Architecture Générale (Next.js)

## Objectif

Le frontend doit :

- Afficher le site vitrine
- Communiquer avec l’API Express
- Gérer l’authentification
- Protéger certaines pages
- Être structuré, propre et scalable

# Initialisation

```bash
npx create-next-app@latest frontend
```

Options recommandées :

- TypeScript
- App Router
- Tailwind
- ESLint
- src directory
- Import alias

Puis :

```
cd frontend
npm run dev
```

Frontend : [http://localhost:3000](http://localhost:3000/)

Backend : [http://localhost:5000](http://localhost:5000/)

# Structure

Dans `src/` :

```
app/
components/
features/
lib/
services/
hooks/
types/
utils/
```

## Rôle des dossiers

| Dossier | Rôle |
| --- | --- |
| app | Pages (App Router) |
| components | UI réutilisable |
| features | Logique métier |
| lib | Config globale |
| services | Appels API |
| hooks | Hooks personnalisés |
| types | Types TypeScript |
| utils | Fonctions utilitaires |

# Connexion au Backend

## Variable d’environnement

`.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Helper API centralisé

`src/lib/api.ts`

```tsx
constAPI_URL=process.env.NEXT_PUBLIC_API_URL;

exportasyncfunctionapiFetch(endpoint:string,options:RequestInit= {}) {
constres=awaitfetch(`${API_URL}${endpoint}`, {
    credentials:"include",
    headers: {
"Content-Type":"application/json",
      ...options.headers,
    },
    ...options,
  });

if (!res.ok) {
consterror=awaitres.json();
thrownewError(error.message||"Erreur API");
  }

returnres.json();
}
```

## 🧼 Bonnes pratiques

- Centraliser les appels API
- Ne pas dupliquer le code fetch
- Gérer les erreurs proprement
- Structurer par feature
- Préparer le projet à la scalabilité

# Architecture & Workflow Global

## Architecture technique

Frontend (Next.js)
↕
API Routes Next (proxy auth)
↕
Backend Express
↕
MongoDB

### Flow Inscription

1. User register
2. Compte inactif
3. Admin valide
4. Admin attribue rôle

### Flow Connexion

1. Login
2. JWT généré
3. Cookie httpOnly
4. `/auth/me` hydrate session

### Flow Admin

1. Admin login
2. Accès dashboard
3. Gestion utilisateurs
4. Modification rôles

## Objectif global

- Séparation front/back claire
- Auth sécurisée
- Gestion des rôles
- Architecture scalable
- Production ready