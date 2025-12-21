# Fitness Gamification Platform

Plateforme SaaS de gamification inter-clubs où les salles de sport s'affrontent via des ligues et saisons.

## 🏗️ Architecture

```
fitness-gamification-platform/
├── backend/              # API Node.js + TypeScript + PostgreSQL
├── mobile-app/          # React Native (iOS + Android)
├── web-admin/           # Interface admin React
└── docs/                # Documentation technique
```

## 🚀 Fonctionnalités principales

- **Mobile App** : Check-in QR, synchronisation HealthKit/Health Connect, dashboard personnel
- **Scoring** : Points via check-in + calories actives
- **Ligues** : Système de promotion/dégradation par tiers (Bronze/Silver/Gold)
- **Multi-tenant** : Gestion de chaînes (brands), clubs, membres
- **Admin Web** : Gestion saisons, leaderboards, imports CSV

## 📱 Technologies

### Backend
- Node.js 20+ / TypeScript
- PostgreSQL 15+
- Express.js
- Node-cron (jobs automatiques)
- JWT authentication

### Mobile
- React Native 0.73+
- React Native Health (HealthKit pour iOS)
- React Native Health Connect (Android)
- React Navigation

### Web Admin
- React 18+
- TypeScript
- Tailwind CSS
- Recharts (visualisations)

## 🛠️ Installation

### Prérequis
- Node.js 20+
- PostgreSQL 15+
- Docker (optionnel)
- Xcode (pour iOS)
- Android Studio (pour Android)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer DATABASE_URL, JWT_SECRET, etc.
npm run db:migrate
npm run dev
```

### Mobile App

```bash
cd mobile-app
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

### Web Admin

```bash
cd web-admin
npm install
npm run dev
```

## 📊 Modèle de données

- **Brand** : Chaînes de clubs
- **Club** : Salles individuelles
- **Member** : Utilisateurs/athlètes
- **Season** : Périodes de compétition (4-8 semaines)
- **HealthDailySummary** : Données santé quotidiennes
- **CheckIn** : Enregistrements QR
- **Scoring** : Points membres et clubs calculés quotidiennement

## 🎯 Règles de scoring (MVP)

- **Check-in** : 50 points/jour (max 1/jour)
- **Calories** : 1 point par 10 kcal actives (cap: 150 pts/jour = 1500 kcal)
- **Score club** : Top N contributeurs par semaine (évite l'effet "gros clubs")
- **Bonus streak** : +20 points après X jours consécutifs

## 🔐 Rôles & permissions

- **SUPER_ADMIN** : Gestion plateforme
- **BRAND_ADMIN** : Gestion chaîne et saisons
- **CLUB_ADMIN** : Gestion salle et QR codes
- **MEMBER** : Participation et scoring

## 📅 Jobs automatiques

- **Quotidien (00:30)** : Recalcul scores membres et clubs
- **Hebdomadaire (lundi 00:10)** : Standings + promotions/dégradations ligues
- **Anti-triche** : Détection anomalies calories

## 🚦 Roadmap MVP

- [x] Architecture et modèle de données
- [x] Backend API core
- [x] Mobile app avec HealthKit/Health Connect
- [x] Web admin basique
- [ ] Tests unitaires
- [ ] Déploiement production
- [ ] Monitoring et analytics

## 📝 Licence

Propriétaire

## 👥 Support

Pour toute question technique, consulter la documentation dans `/docs`
