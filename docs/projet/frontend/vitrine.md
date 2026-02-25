# Pages Vitrine – Site Complet

## Objectif

Structurer toutes les pages publiques du site.

# Pages principales

- `/` → Accueil
- `/club`
- `/equipes`
- `/actualites`
- `/partenaires`
- `/informations-pratiques`
- `/galeries`
- `/contact`
- `/mentions-legales`
- `/politique-confidentialite`
- Boutique & Licences : Redirection vers SportEasy

# Structure recommandée

```
app/
  page.tsx
  club/page.tsx
  equipes/page.tsx
  actualites/page.tsx
  actualites/[slug]/page.tsx
  partenaires/page.tsx
  informations-pratiques/page.tsx
  galeries/page.tsx
  galeries/[id]/page.tsx
  contact/page.tsx
  mentions-legales/page.tsx
  politique-confidentialite/page.tsx
```

# Pages dynamiques

## Actualités

- Liste des articles
- Page détail via `[slug]`
- SEO dynamique

## Galeries

- Liste des albums
- Page détail galerie

# Page Contact

- Formulaire
- Validation
- Envoi backend
- Message confirmation

# Pages légales

- Mentions légales
- Politique de confidentialité
- RGPD

# Évolutions futures

- CMS interne
- Pagination actualités
- Recherche
- Multilingue
- Optimisation SEO avancée