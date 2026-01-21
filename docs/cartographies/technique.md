# Cartographie technique

> Vue architecture logicielle
> 

## Frontend (React)

- Application SPA (React)
- Routing public / privé
- Pages publiques
- Interface back-office
- Gestion de l’authentification (JWT)
- Appels API REST

## Backend (Node.js / Express)

### API REST

- Authentification / autorisation
- Gestion des utilisateurs
- Gestion du club
- Gestion des saisons / équipes / membres
- Gestion des contenus (news, albums, médias)
- Gestion des partenaires

### Services

- Service FFVB (scraping / import)
- Service de logs
- Service statistiques
- Service sauvegarde

### Sécurité

- Hash mots de passe (bcrypt)
- JWT
- Middlewares de rôles
- Validation des données

## Base de données (MongoDB)

- Collections :
    - users
    - club
    - seasons
    - teams
    - members
    - news
    - albums
    - media
    - partners
    - championships_ffvb
    - standings_ffvb
    - matches_ffvb
    - scraping_logs

## Services externes

- FFVB (classements, matchs)
- SportEasy (liens licences / boutique)
- Google Maps
- Outil analytics