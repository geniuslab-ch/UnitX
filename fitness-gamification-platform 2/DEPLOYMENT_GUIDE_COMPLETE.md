# 🚀 Guide de Déploiement Complet - UNITX Fitness Gamification Platform

## 📦 Package Complet Prêt au Déploiement

Cette archive contient **TOUT** ce dont vous avez besoin pour déployer la plateforme complète avec le branding UNITX.

## 📁 Contenu de l'Archive

```
fitness-gamification-platform/
├── backend/                    # ✅ API Node.js/TypeScript/PostgreSQL
│   ├── src/                    # Code source backend
│   ├── Dockerfile              # Image Docker backend
│   ├── package.json            # Dépendances
│   └── .env.example            # Configuration
│
├── mobile-app/                 # ✅ App React Native (iOS + Android)
│   ├── src/                    # Code source mobile
│   ├── ios/                    # Projet iOS
│   ├── android/                # Projet Android
│   └── package.json            # Dépendances
│
├── web-admin/                  # ✅ Frontend UNITX (React + Tailwind)
│   ├── src/
│   │   ├── pages/              # Pages (Login, Dashboard, Clubs, etc.)
│   │   ├── components/         # Composants (Layout, Cards, etc.)
│   │   ├── stores/             # State management
│   │   └── api/                # API client
│   ├── public/
│   │   └── logo.png            # ✅ Logo UNITX
│   ├── Dockerfile              # Image Docker frontend
│   ├── nginx.conf              # Configuration Nginx
│   └── package.json            # Dépendances
│
├── docs/                       # 📚 Documentation complète
│   ├── TECHNICAL_DOCUMENTATION.md
│   ├── PRODUCTION_DEPLOYMENT.md
│   ├── FRONTEND_DEPLOYMENT.md
│   ├── CSV_IMPORT.md
│   └── UNITX_BRANDING_GUIDE.md
│
├── docker-compose.yml          # ✅ Déploiement Docker complet
├── QUICKSTART.md               # Guide démarrage rapide
├── README.md                   # Vue d'ensemble
└── UNITX_BRANDING_GUIDE.md     # Guide branding UNITX
```

## 🎨 Nouveau Design UNITX

### ✅ Intégrations Complètes

1. **Logo UNITX** 
   - Placé dans `/web-admin/public/logo.png`
   - Utilisé dans Login et Sidebar
   - Effet glow animé

2. **Palette de Couleurs**
   - Navy: `#1e3a5f` (bleu foncé)
   - Blue: `#0284c7` (principal)
   - Cyan: `#06b6d4` (brillant)
   - Light: `#38bdf8` (clair)

3. **Dégradés Partout**
   - Boutons: Bleu → Cyan
   - Textes: Animés avec gradient
   - Cards: Bordures lumineuses
   - Background: Sombre avec hint bleu

## 🚀 Déploiement Rapide (5 minutes)

### Option 1: Docker Compose (Recommandé)

```bash
# 1. Extraire l'archive
tar -xzf fitness-gamification-platform-complete.tar.gz
cd fitness-gamification-platform

# 2. Lancer TOUT (Backend + Frontend + DB)
docker-compose up -d

# 3. Vérifier
docker-compose ps

# URLs disponibles:
# - Frontend: http://localhost:3001
# - Backend API: http://localhost:3000
# - PostgreSQL: localhost:5432
```

**C'est tout !** Le frontend UNITX, le backend et la base de données sont maintenant actifs ! 🎉

### Option 2: Développement Local

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos configs
npm run dev
```

#### Frontend UNITX
```bash
cd web-admin
npm install
npm run dev
# Ouvre http://localhost:3001
```

#### Mobile App
```bash
cd mobile-app
npm install
# iOS
npm run ios
# Android
npm run android
```

## 🎯 Configuration Initiale

### 1. Base de Données

```bash
# Se connecter à PostgreSQL
docker-compose exec postgres psql -U postgres

# Créer un super admin
INSERT INTO members (
  id, email, password_hash, role, status
) VALUES (
  gen_random_uuid(),
  'admin@unitx.com',
  '$2b$10$...',  -- Hash de 'admin123'
  'SUPER_ADMIN',
  'ACTIVE'
);
```

### 2. Variables d'Environnement

**Backend (.env):**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/fitness_gamification
JWT_SECRET=your-super-secret-key-change-this
QR_CODE_SECRET=another-secret-key-for-qr
NODE_ENV=production
PORT=3000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_ENV=production
```

## 📊 Fonctionnalités Incluses

### ✅ Backend API
- Multi-tenant (brands/clubs)
- Authentication JWT
- Health data sync
- QR check-in system
- Scoring engine
- League system (Bronze/Silver/Gold)
- Anti-cheat detection
- Automated cron jobs
- CSV import
- Audit logging

### ✅ Frontend UNITX
- **Login** avec logo UNITX
- **Dashboard** avec stats & graphiques
- **Clubs** - Gestion complète
- **Members** - Liste et stats
- **Seasons** - Création et config
- **Leaderboard** - Classements temps réel
- **QR Codes** - Génération
- **Settings** - Configuration
- Design sombre avec dégradés
- Responsive (mobile/tablet/desktop)

### ✅ Mobile App
- iOS (HealthKit)
- Android (Health Connect)
- QR Scanner
- Dashboard personnel
- Stats & progression
- Onboarding

## 🌐 Déploiement Production

### Option A: VPS (Ubuntu/Debian)

```bash
# 1. Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Upload l'archive
scp fitness-gamification-platform-complete.tar.gz user@server:/home/user/

# 4. Sur le serveur
ssh user@server
tar -xzf fitness-gamification-platform-complete.tar.gz
cd fitness-gamification-platform

# 5. Configurer .env
nano backend/.env
nano web-admin/.env

# 6. Lancer
docker-compose up -d

# 7. Configurer Nginx (reverse proxy)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/unitx
```

**Config Nginx:**
```nginx
server {
    listen 80;
    server_name unitx.votredomaine.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/unitx /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL avec Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d unitx.votredomaine.com
```

### Option B: AWS

**1. RDS pour PostgreSQL**
```bash
# Créer une instance RDS PostgreSQL
# Copier l'endpoint dans backend/.env
DATABASE_URL=postgresql://user:pass@endpoint.rds.amazonaws.com:5432/fitness_db
```

**2. ECS pour les containers**
```bash
# Créer un cluster ECS
aws ecs create-cluster --cluster-name unitx-cluster

# Push les images vers ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin xxx.dkr.ecr.eu-west-1.amazonaws.com

docker build -t unitx-backend ./backend
docker tag unitx-backend:latest xxx.dkr.ecr.eu-west-1.amazonaws.com/unitx-backend:latest
docker push xxx.dkr.ecr.eu-west-1.amazonaws.com/unitx-backend:latest

docker build -t unitx-frontend ./web-admin
docker tag unitx-frontend:latest xxx.dkr.ecr.eu-west-1.amazonaws.com/unitx-frontend:latest
docker push xxx.dkr.ecr.eu-west-1.amazonaws.com/unitx-frontend:latest
```

**3. CloudFront pour le Frontend**
```bash
# Ou build static et deploy sur S3
cd web-admin
npm run build
aws s3 sync dist/ s3://unitx-frontend --delete
# Créer une distribution CloudFront pointant vers le bucket
```

### Option C: Netlify + Heroku

**Frontend sur Netlify:**
```bash
cd web-admin
npm run build
netlify deploy --prod --dir=dist
```

**Backend sur Heroku:**
```bash
cd backend
heroku create unitx-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

## 🔧 Configuration Avancée

### 1. Cron Jobs

Les jobs automatiques sont configurés dans `backend/src/jobs/cron.ts`:

```typescript
// Calcul des scores quotidiens
cron.schedule('30 0 * * *', async () => {
  await recalculateDailyScores();
});

// Mise à jour des classements (lundi)
cron.schedule('10 0 * * 1', async () => {
  await calculateWeeklyStandings();
});
```

### 2. Emails (à configurer)

Ajouter dans `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@unitx.com
SMTP_PASS=your-app-password
```

### 3. Storage (fichiers)

Pour stocker les avatars, QR codes, etc.:
```env
# S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_BUCKET_NAME=unitx-uploads
AWS_REGION=eu-west-1
```

## 📱 Déploiement Mobile

### iOS (App Store)

```bash
cd mobile-app/ios
# 1. Ouvrir dans Xcode
open FitnessGamification.xcworkspace

# 2. Configurer:
# - Bundle ID: com.unitx.fitnessgame
# - Team: Votre compte développeur
# - Signing: Automatic

# 3. Archive et Upload
# Product > Archive
# Distribute App > App Store Connect
```

### Android (Play Store)

```bash
cd mobile-app/android

# 1. Générer keystore
keytool -genkeypair -v -storetype PKCS12 -keystore unitx.keystore -alias unitx -keyalg RSA -keysize 2048 -validity 10000

# 2. Build release
./gradlew assembleRelease

# 3. APK dans:
# android/app/build/outputs/apk/release/app-release.apk

# 4. Upload sur Play Console
```

## 🧪 Tests

### Backend
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend
```bash
cd web-admin
npm test
npm run test:e2e
```

### API (manuel)
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@unitx.com","password":"admin123"}'

# Get clubs (avec token)
curl http://localhost:3000/api/v1/clubs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Monitoring

### Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f web-admin

# Logs dans les containers
docker-compose exec backend tail -f /var/log/app.log
```

### Health Checks

```bash
# Backend health
curl http://localhost:3000/health

# Database
docker-compose exec postgres pg_isready

# All services
docker-compose ps
```

### Métriques

Ajouter dans `backend/package.json`:
```json
"dependencies": {
  "prom-client": "^14.0.0"
}
```

Endpoint metrics: `http://localhost:3000/metrics`

## 🔒 Sécurité

### Checklist Pré-Production

- [ ] Changer tous les secrets (.env)
- [ ] Activer HTTPS (SSL)
- [ ] Configurer CORS restrictif
- [ ] Activer rate limiting
- [ ] Backup automatique DB
- [ ] Monitoring actif
- [ ] Logs sécurisés
- [ ] Firewall configuré
- [ ] Updates système

### Backup Base de Données

```bash
# Backup manuel
docker-compose exec postgres pg_dump -U postgres fitness_gamification > backup.sql

# Backup automatique (cron)
0 2 * * * docker-compose exec postgres pg_dump -U postgres fitness_gamification > /backups/db_$(date +\%Y\%m\%d).sql
```

## 🎯 Post-Déploiement

### 1. Créer le premier super admin

```sql
INSERT INTO members (id, email, password_hash, role, status)
VALUES (
  gen_random_uuid(),
  'admin@unitx.com',
  '$2b$10$XYZ...',  -- hash de votre mot de passe
  'SUPER_ADMIN',
  'ACTIVE'
);
```

### 2. Importer les clubs

```bash
# Via l'interface web admin
# Ou via API
curl -X POST http://localhost:3000/api/v1/clubs/import \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@clubs.csv"
```

### 3. Créer une première saison

Via l'interface web admin → Seasons → Create Season

### 4. Tester le flow complet

1. Login admin → ✅
2. Créer un club → ✅
3. Importer des membres → ✅
4. Créer une saison → ✅
5. Générer QR code → ✅
6. Tester check-in (mobile) → ✅
7. Voir le leaderboard → ✅

## 🆘 Troubleshooting

### Frontend ne se connecte pas au backend

```bash
# Vérifier CORS
# backend/.env
CORS_ORIGIN=http://localhost:3001,https://unitx.votredomaine.com

# Vérifier l'URL API
# web-admin/.env
VITE_API_URL=http://localhost:3000/api/v1
```

### Base de données ne démarre pas

```bash
# Vérifier les logs
docker-compose logs postgres

# Reset complet
docker-compose down -v
docker-compose up -d
```

### Logo ne s'affiche pas

```bash
# Vérifier que le logo existe
ls web-admin/public/logo.png

# En dev, le logo doit être dans public/
# En production (après build), il sera dans dist/
```

## 📚 Documentation

Tous les détails sont dans `/docs`:

- **TECHNICAL_DOCUMENTATION.md** - Architecture complète (90+ pages)
- **PRODUCTION_DEPLOYMENT.md** - Déploiement production
- **FRONTEND_DEPLOYMENT.md** - Déploiement frontend
- **UNITX_BRANDING_GUIDE.md** - Guide branding UNITX
- **CSV_IMPORT.md** - Format CSV et import

## 🎉 Félicitations !

Votre plateforme UNITX Fitness Gamification est maintenant déployée ! 🚀

**Prochaines étapes:**
1. Personnaliser davantage le branding
2. Configurer les emails de notification
3. Ajouter des clubs et membres
4. Lancer la première saison
5. Promouvoir auprès des clubs

**Support:**
- Documentation: `/docs`
- Issues: GitHub
- Email: support@unitx.com

---

**Version:** UNITX Complete v1.0  
**Date:** Décembre 2024  
**Ready for Production** ✅
