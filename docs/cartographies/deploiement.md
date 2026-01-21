# Cartographie de déploiement

> Vue infrastructure
> 

## Environnements

- Développement
- Pré-production
- Production

## Architecture de déploiement

### Client

- Navigateur web
- Accès HTTPS

### Frontend

- React build statique
- Hébergement :
    - Vercel / Netlify / Nginx
- CDN pour les assets

### Backend

- Serveur Node.js / Express
- API REST sécurisée
- Tâches planifiées (cron jobs)
- Déploiement :
    - VPS
    - Docker (optionnel)

### Base de données

- MongoDB Atlas
- Accès sécurisé
- Sauvegardes automatiques

### Automatisations

- Cron jobs :
    - Scraping FFVB
    - Mise à jour classements
    - Nettoyage logs
- Logs centralisés

### Sécurité & supervision

- HTTPS
- Variables d’environnement
- Monitoring serveur
- Logs applicatifs
- Sauvegardes régulières

## Flux principaux

1. Visiteur → Frontend → API → MongoDB
2. Administrateur → Back-office → API sécurisée
3. Cron → Service FFVB → API → MongoDB
4. Frontend → Services externes (Maps / SportEasy)