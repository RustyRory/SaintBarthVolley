# Dashboard Admin

## Objectif

Permettre à l’administrateur de :

- Voir tous les utilisateurs
- Activer / désactiver un compte
- Modifier le rôle
- Supprimer un utilisateur

# Structure

```
app/admin/layout.tsx
app/admin/page.tsx
app/admin/users/page.tsx
```

# Layout Admin

- Sidebar
- Navigation interne
- Section principale

# Page Users

Fonctionnalités :

- Liste des utilisateurs
- Bouton Activer
- Modifier rôle
- Supprimer

# Routes API Next

```
app/api/admin/users/route.ts
app/api/admin/users/[id]/activate/route.ts
app/api/admin/users/[id]/role/route.ts
```

# Sécurité

- Cookie obligatoire
- Vérification rôle admin
- Backend protégé

# Améliorations futures

- Pagination
- Recherche utilisateur
- Filtres
- Toast notifications
- Audit logs