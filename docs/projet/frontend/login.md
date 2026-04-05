# Authentification – Login & Sécurité

### Objectif

Mettre en place :

- Login sécurisé
- Stockage JWT sécurisé
- Vérification utilisateur connecté
- Protection des routes
- Gestion des rôles

### Flow Authentification

1. POST login
2. Backend génère JWT
3. Cookie httpOnly envoyé
4. Front envoie automatiquement le cookie
5. `/auth/me` identifie l’utilisateur

## Route Login

`app/api/auth/login/route.ts`

- Appelle backend `/auth/login`
- Stocke le token dans un cookie sécurisé

## Route /auth/me

`app/api/auth/me/route.ts`

- Lit le cookie
- Envoie Authorization Bearer au backend
- Retourne l’utilisateur connecté

## Middleware

`middleware.ts`

- Vérifie présence token
- Redirige vers `/login` si nécessaire

## Protection par rôle

Dans `admin/layout.tsx` :

- Appeler `/api/auth/me`
- Vérifier `role === "admin"`
- Rediriger sinon

## Logout

Créer :

`app/api/auth/logout/route.ts`

Supprimer le cookie token.