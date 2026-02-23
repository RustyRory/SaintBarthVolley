# Frontend

1. Afficher des pages (site vitrine)
2. Se connecter à API Express
3. Gérer l’authentification
4. Protéger certaines pages (dashboard)
5. Gérer les formulaires (login, CRUD)
6. Être propre, structuré et scalable

## Initialisation du projet

```
npx create-next-app@latest frontend
```

Choix :

- ✅ TypeScript
- ✅ App Router
- ✅ Tailwind
- ✅ ESLint
- ✅ src directory
- ✅ Import alias

Puis :

```
cd frontend
npm run dev
```

Frontend → `http://localhost:3000`

Backend → `http://localhost:5000`

⚠️ Deux ports différents → CORS nécessaire (déjà fait côté backend).

## Architecture

Dans `src/` :

```
app/
components/
features/
lib/
hooks/
services/
types/
utils/
```

### Rôle des dossiers

| Dossier | Rôle |
| --- | --- |
| app | Pages (App Router) |
| components | UI réutilisable |
| features | Logique métier par domaine |
| lib | config globale (fetch, helpers) |
| services | appels API |
| hooks | hooks personnalisés |
| types | types TypeScript |
| utils | fonctions utilitaires |

## Connexion au backend avec fetch

### Variable d’environnement

Créer `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

⚠️ Toujours préfixer par `NEXT_PUBLIC_` si utilisé côté navigateur.

### Créer un helper fetch centralisé

`src/lib/api.ts`

```tsx
constAPI_URL=process.env.NEXT_PUBLIC_API_URL;

exportasyncfunctionapiFetch(
endpoint:string,
options:RequestInit= {}
) {
constres=awaitfetch(`${API_URL}${endpoint}`, {
    credentials:"include",// important si cookie httpOnly
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

### Pourquoi faire ça ?

✔ Centraliser les appels API

✔ Gérer les erreurs

✔ Ajouter automatiquement credentials

✔ Ne pas répéter du code partout

### Tester un GET (première connexion réelle)

Exemple :

`app/users/page.tsx`

```tsx
"use client";

import {useEffect,useState }from"react";
import {apiFetch }from"@/lib/api";

exportdefaultfunctionUsersPage() {
const [users,setUsers]=useState([]);

useEffect(() => {
asyncfunctionfetchUsers() {
try {
	constdata=awaitapiFetch("/users");
	setUsers(data);
      }catch (error) {
console.error(error);
      }
    }

fetchUsers();
  }, []);

return (
<div>
<h1>Liste des utilisateurs</h1>
      {users.map((user:any) => (
<divkey={user._id}>
          {user.firstName} {user.lastName}
</div>
      ))}
</div>
  );
}
```

Si ça marche → le frontend parle bien au backend.

## Authentification

### Bonne pratique moderne

Ne PAS stocker le JWT dans localStorage.

👉 Préférer un cookie httpOnly envoyé par le backend.

---

### Flow propre

1. Login → POST /api/auth/login
2. Backend génère JWT
3. Backend envoie cookie httpOnly
4. Front fait fetch avec `credentials: "include"`
5. Le cookie est envoyé automatiquement

### Exemple Login

`app/login/page.tsx`

```tsx
"use client";

import {useState }from"react";
import {apiFetch }from"@/lib/api";
import {useRouter }from"next/navigation";

exportdefaultfunctionLoginPage() {
const [email,setEmail]=useState("");
const [password,setPassword]=useState("");
constrouter=useRouter();

asyncfunctionhandleSubmit(e:React.FormEvent) {
e.preventDefault();

try {
awaitapiFetch("/auth/login", {
        method:"POST",
        body:JSON.stringify({ email, password }),
      });

router.push("/dashboard");
    }catch (error) {
console.error(error);
    }
  }

return (
<formonSubmit={handleSubmit}>
<inputonChange={(e) =>setEmail(e.target.value)}/>
<input
type="password"
onChange={(e) =>setPassword(e.target.value)}
/>
<buttontype="submit">Login</button>
</form>
  );
}
```

## Protéger les pages privées

Exemple : `/dashboard`

Tu dois vérifier si l’utilisateur est connecté.

### Méthode simple

Créer une route backend :

```
GET /api/auth/me
```

qui retourne l’utilisateur connecté si le cookie est valide.

### Dans `/dashboard/page.tsx`

```tsx
import {redirect }from"next/navigation";

exportdefaultasyncfunctionDashboardPage() {
constres=awaitfetch(
"http://localhost:5000/api/auth/me",
    { credentials:"include" }
  );

if (!res.ok) {
redirect("/login");
  }

constuser=awaitres.json();

return<div>Bienvenue {user.firstName}</div>;
}
```

## Layout global

`app/layout.tsx`

- Navbar
- Footer
- Container

Exemple structure :

```
app/
  layout.tsx
  page.tsx
  login/page.tsx
  dashboard/page.tsx
  users/page.tsx
```

## Gestion des formulaires

Installer :

```
npm install react-hook-form zod @hookform/resolvers
```

Pourquoi ?

✔ Validation propre

✔ Gestion d’erreurs

✔ Meilleure UX

✔ Code plus propre

## Performance & bonnes pratiques

✔ Utiliser `<Image />` de Next

✔ next/font

✔ Responsive mobile-first

✔ Lighthouse > 90

✔ Pas de clé API côté client

✔ Rate limit backend

# Ordre logique de travail

Voici ton plan clair :

1. ✅ Connecter fetch
2. ✅ Tester GET /users
3. ✅ Créer page login
4. ✅ Implémenter cookie auth
5. ✅ Créer /auth/me
6. ✅ Protéger dashboard
7. ✅ Faire CRUD
8. ✅ Layout admin
9. ✅ Formulaires propres
10. ✅ SEO + metadata