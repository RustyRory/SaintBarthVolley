# Pages – Structure & Organisation

## Objectif

Organiser les pages publiques et privées de manière claire et scalable.

# Structure App Router

```
app/
  layout.tsx
  page.tsx
  login/page.tsx
  register/page.tsx
  dashboard/page.tsx
  admin/
    layout.tsx
    page.tsx
    users/page.tsx
```

# Pages publiques

- `/` → Accueil
- `/login`
- `/register`

# Pages protégées

- `/dashboard`
- `/admin`
- `/admin/users`

# Layout Global

`app/layout.tsx` contient :

- Navbar
- Footer
- Container principal

# SEO & Metadata

Dans chaque page :

```tsx
exportconstmetadata= {
  title:"Titre de la page",
  description:"Description SEO",
};
```