# Documentation Technique - Plateforme de Gamification Fitness

## 📋 Table des matières

1. [Architecture générale](#architecture)
2. [Installation & Déploiement](#installation)
3. [Modèle de données](#modèle-de-données)
4. [API Backend](#api-backend)
5. [Application Mobile](#application-mobile)
6. [Interface Web Admin](#interface-web-admin)
7. [Règles de scoring](#règles-de-scoring)
8. [Jobs automatiques](#jobs-automatiques)
9. [Sécurité](#sécurité)
10. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture

### Stack technologique

#### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **Authentication**: JWT
- **Cron Jobs**: node-cron

#### Mobile App
- **Framework**: React Native 0.73
- **Navigation**: React Navigation
- **State Management**: Zustand
- **Health Data**: 
  - iOS: react-native-health (HealthKit)
  - Android: react-native-health-connect
- **QR Scanner**: react-native-qrcode-scanner

#### Web Admin
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **QR Generation**: qrcode.react

### Architecture des services

```
┌─────────────────┐
│  Mobile App     │
│  (iOS/Android)  │
└────────┬────────┘
         │
         │ HTTPS/REST
         │
┌────────▼────────┐       ┌──────────────┐
│   Backend API   │◄──────┤  Web Admin   │
│   (Express.js)  │       │   (React)    │
└────────┬────────┘       └──────────────┘
         │
         │
┌────────▼────────┐
│   PostgreSQL    │
│   (Database)    │
└─────────────────┘
```

---

## 🚀 Installation & Déploiement

### Prérequis

- Node.js 20+ et npm
- PostgreSQL 15+
- Docker & Docker Compose (optionnel)
- Pour mobile:
  - Xcode 15+ (iOS)
  - Android Studio (Android)
  - CocoaPods (iOS)

### Installation locale

#### 1. Backend

```bash
cd backend
npm install
cp .env.example .env

# Configurer .env avec vos paramètres
# DATABASE_URL, JWT_SECRET, etc.

# Créer la base de données
psql -U postgres -c "CREATE DATABASE fitness_gamification;"

# Exécuter les migrations
npm run db:migrate

# Démarrer le serveur
npm run dev
```

#### 2. Mobile App

```bash
cd mobile-app
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

#### 3. Web Admin

```bash
cd web-admin
npm install
npm run dev
```

### Déploiement avec Docker

```bash
# À la racine du projet
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

Les services seront disponibles sur:
- Backend API: http://localhost:3000
- Web Admin: http://localhost:3001
- PostgreSQL: localhost:5432

---

## 💾 Modèle de données

### Entités principales

#### Brands (Chaînes)
Représente une chaîne de salles de sport.

```sql
CREATE TABLE brands (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(2),
    status entity_status DEFAULT 'ACTIVE'
);
```

#### Clubs (Salles)
Salles individuelles appartenant à une chaîne.

```sql
CREATE TABLE clubs (
    id UUID PRIMARY KEY,
    brand_id UUID REFERENCES brands(id),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    timezone VARCHAR(50),
    qr_token_secret VARCHAR(255),
    status entity_status DEFAULT 'ACTIVE'
);
```

#### Members (Membres/Athlètes)
Utilisateurs participant aux challenges.

```sql
CREATE TABLE members (
    id UUID PRIMARY KEY,
    club_id UUID REFERENCES clubs(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    health_consent_granted BOOLEAN,
    status entity_status DEFAULT 'ACTIVE'
);
```

#### Seasons (Saisons)
Périodes de compétition de 4-8 semaines.

```sql
CREATE TABLE seasons (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    scope season_scope,
    status season_status
);
```

#### HealthDailySummary
Données santé quotidiennes synchronisées depuis les devices.

```sql
CREATE TABLE health_daily_summary (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES members(id),
    date DATE NOT NULL,
    active_calories INTEGER,
    steps INTEGER,
    source health_data_source,
    anomaly_flag BOOLEAN DEFAULT FALSE
);
```

#### MemberScoreDaily
Points calculés quotidiennement pour chaque membre.

```sql
CREATE TABLE member_score_daily (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES members(id),
    date DATE NOT NULL,
    points_checkin INTEGER,
    points_calories INTEGER,
    points_bonus INTEGER,
    total_points INTEGER,
    streak_days INTEGER
);
```

### Relations clés

- Brand → Clubs (1:N)
- Club → Members (1:N)
- Season → Clubs (N:M via season_clubs)
- Member → HealthDailySummary (1:N)
- Member → MemberScoreDaily (1:N)
- Club → ClubScoreDaily (1:N)

---

## 🔌 API Backend

### Authentification

#### POST /api/v1/auth/signup
Créer un nouveau compte utilisateur.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "club_code": "ABC123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "MEMBER",
    "member_id": "uuid"
  }
}
```

#### POST /api/v1/auth/login
Connexion avec email/password.

### Santé & Check-in

#### POST /api/v1/health/sync
Synchroniser les données santé depuis l'app mobile.

**Request:**
```json
{
  "date": "2024-12-16",
  "active_calories": 450,
  "steps": 8500,
  "source": "HEALTHKIT",
  "timezone": "Europe/Paris"
}
```

#### POST /api/v1/health/checkin
Check-in via QR code.

**Request:**
```json
{
  "club_id": "uuid",
  "qr_token": "abc123...",
  "timestamp": 1702742400
}
```

#### GET /api/v1/health/members/me/score
Récupérer les points d'un membre.

**Query params:**
- `range`: today | week | month

**Response:**
```json
{
  "range": "week",
  "daily_scores": [...],
  "totals": {
    "checkin": 250,
    "calories": 380,
    "bonus": 60,
    "total": 690
  },
  "current_streak": 5
}
```

### Clubs & Leaderboards

#### GET /api/v1/clubs
Lister les clubs.

#### GET /api/v1/leaderboard/clubs
Classement des clubs par saison.

**Query params:**
- `season_id`: UUID
- `tier`: BRONZE | SILVER | GOLD
- `week`: YYYY-MM-DD (Monday)

---

## 📱 Application Mobile

### Structure des dossiers

```
mobile-app/
├── src/
│   ├── api/          # Clients API
│   ├── screens/      # Écrans de l'app
│   ├── navigation/   # Configuration navigation
│   ├── services/     # Services (health, etc.)
│   ├── stores/       # State management
│   ├── components/   # Composants réutilisables
│   └── utils/        # Utilitaires
├── ios/              # Configuration iOS
└── android/          # Configuration Android
```

### Intégration HealthKit (iOS)

Dans `Info.plist`:
```xml
<key>NSHealthShareUsageDescription</key>
<string>We need access to your active calories to track your fitness progress</string>
```

### Intégration Health Connect (Android)

Dans `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.health.READ_ACTIVE_CALORIES_BURNED"/>
<uses-permission android:name="android.permission.health.READ_STEPS"/>
```

### Flux utilisateur

1. **Onboarding**: Signup → Choisir club → Consentement santé
2. **Dashboard**: Points du jour, calories, check-in
3. **Check-in**: Scanner QR → Validation → +50 points
4. **Sync santé**: Automatique en background toutes les heures
5. **Leaderboard**: Classement club et ligues

---

## 🖥️ Interface Web Admin

### Écrans principaux

#### Dashboard
- Vue d'ensemble: clubs actifs, membres, saisons
- Graphiques d'activité
- Métriques clés

#### Clubs
- Liste des clubs
- Import CSV
- Gestion individuelle

#### Seasons
- Créer une saison
- Configurer règles de scoring
- Inviter clubs

#### QR Codes
- Générer QR pour check-in
- Rotation automatique (5 min)
- Téléchargement PNG

#### Leaderboard
- Classement temps réel
- Filtres par tier/semaine
- Export données

---

## 🎯 Règles de scoring

### Points par action

**Check-in quotidien:**
- 50 points par check-in
- Maximum 1 par jour
- Validation via QR code

**Calories actives:**
- 1 point par 10 kcal actives
- Cap quotidien: 150 points (= 1500 kcal)
- Source: HealthKit ou Health Connect

**Bonus streak:**
- +20 points après 3 jours consécutifs d'activité
- Réinitialisation si jour sans activité
- Activité = check-in OU calories > 100

### Score club (Top N)

Pour éviter que les gros clubs gagnent toujours:

1. Chaque semaine, on prend les points de tous les membres
2. On trie par ordre décroissant
3. On ne garde que les **Top N** contributeurs (ex: N=50)
4. Le score du club = somme des points des Top N

**Membre actif** = au moins 1 check-in OU au moins 100 calories sur la semaine

### Anti-triche

**Détection d'anomalies:**
- Calories > 2500/jour → flag
- Spike > +1000 kcal en < 30 min → flag
- Points flaggés = exclus du scoring

**QR codes:**
- Rotation toutes les 5 minutes
- Token HMAC-SHA256
- Géofencing (phase 2)

---

## ⏰ Jobs automatiques

### Job quotidien (00:30 UTC)
**Fonction:** Recalculer les scores membres et clubs

```typescript
// Pseudo-code
for each active member:
  calculate_daily_score(member, yesterday)
  
for each active season:
  for each club in season:
    calculate_club_daily_score(club, season, yesterday)
```

### Job hebdomadaire (Lundi 00:10 UTC)
**Fonction:** Calculer standings et appliquer promotions/dégradations

```typescript
// Pseudo-code
for each active season:
  calculate_weekly_standings(season, last_monday)
  apply_promotions_demotions(season, last_monday)
```

### Job anti-triche (02:00 UTC)
**Fonction:** Détecter anomalies dans les données santé

### Job nettoyage (Dimanche 03:00 UTC)
**Fonction:** Archiver/supprimer anciennes données

---

## 🔒 Sécurité

### Authentication
- JWT avec expiration 7 jours
- Refresh tokens 30 jours
- Bcrypt avec 10 rounds pour passwords

### Authorization
- Middleware basé sur les rôles
- SUPER_ADMIN > BRAND_ADMIN > CLUB_ADMIN > MEMBER
- Vérification des permissions par route

### Rate Limiting
- 100 requêtes / 15 minutes par IP
- Rate limit plus strict pour signup/login

### QR Codes
- Rotation toutes les 5 minutes
- Token signé avec HMAC-SHA256
- Validation de l'expiration

### RGPD
- Consentement explicite pour données santé
- Export de données sur demande
- Suppression complète possible

---

## 🐛 Troubleshooting

### Backend ne démarre pas

**Problème:** Erreur de connexion à la DB
```
Solution:
1. Vérifier que PostgreSQL est démarré
2. Vérifier DATABASE_URL dans .env
3. Tester connexion: psql -U postgres
```

**Problème:** Port 3000 déjà utilisé
```
Solution:
1. Changer PORT dans .env
2. Ou tuer le processus: lsof -ti:3000 | xargs kill
```

### Mobile app - iOS

**Problème:** HealthKit ne fonctionne pas
```
Solution:
1. Vérifier Info.plist contient NSHealthShareUsageDescription
2. Vérifier capabilities dans Xcode (HealthKit activé)
3. Tester sur device réel (pas simulateur)
```

### Mobile app - Android

**Problème:** Health Connect non disponible
```
Solution:
1. Installer Health Connect depuis Play Store
2. Vérifier AndroidManifest.xml contient les permissions
3. Vérifier API level >= 26
```

### Jobs cron ne s'exécutent pas

**Problème:** Jobs ne se lancent pas
```
Solution:
1. Vérifier NODE_ENV != 'test'
2. Vérifier logs: docker-compose logs -f backend
3. Tester manuellement: curl http://localhost:3000/api/v1/admin/trigger-daily-job
```

### Données de scoring incorrectes

**Problème:** Points ne correspondent pas
```
Solution:
1. Vérifier ruleset_id de la saison
2. Relancer recalcul: POST /api/v1/admin/recalculate-scores
3. Vérifier anomaly_flag dans health_daily_summary
```

---

## 📊 Monitoring & Logs

### Logs backend
```bash
# Development
npm run dev

# Production
docker-compose logs -f backend
```

### Métriques clés à surveiller
- Taux de check-in quotidien
- Taux de synchronisation santé
- Anomalies détectées
- Temps de réponse API
- Erreurs 5xx

### Audit logs
Tous les changements administratifs sont loggés dans `audit_logs`:
- Création/modification saisons
- Import clubs/membres
- Changements de rôles

---

## 🚀 Évolutions futures

### Phase 2
- [ ] Géofencing pour check-ins
- [ ] Notifications push
- [ ] Challenges personnalisés
- [ ] Intégration Apple Sign-In / Google Sign-In
- [ ] Analytics avancés
- [ ] Multi-langue

### Phase 3
- [ ] Social features (feed, commentaires)
- [ ] Récompenses et badges
- [ ] Intégration wearables (Garmin, Fitbit)
- [ ] API publique pour partners
- [ ] White-label solution

---

## 📞 Support

Pour toute question technique:
- Documentation: /docs
- GitHub Issues: (à définir)
- Email: support@yourplatform.com

---

**Version:** 1.0.0  
**Dernière mise à jour:** Décembre 2024
