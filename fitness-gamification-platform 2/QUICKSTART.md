# 🚀 Quick Start Guide

## Installation rapide (5 minutes)

### Option 1: Docker (Recommandé)

```bash
# 1. Cloner le projet
git clone <your-repo>
cd fitness-gamification-platform

# 2. Configurer les variables d'environnement
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos valeurs

# 3. Démarrer tous les services
docker-compose up -d

# 4. Vérifier que tout fonctionne
curl http://localhost:3000/health
# Devrait retourner: {"status":"healthy"}

# 5. Accéder aux interfaces
# Backend API: http://localhost:3000
# Web Admin: http://localhost:3001
```

### Option 2: Installation locale

#### Backend

```bash
cd backend
npm install
cp .env.example .env

# Créer la base de données
createdb fitness_gamification

# Appliquer le schéma
psql fitness_gamification < src/database/schema.sql

# Démarrer
npm run dev
```

#### Web Admin

```bash
cd web-admin
npm install
npm run dev
# Ouvre http://localhost:5173
```

#### Mobile App

```bash
cd mobile-app
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

## 🎯 Premier test

### 1. Créer un super admin

```sql
-- Connecter à la DB
psql fitness_gamification

-- Créer un admin
INSERT INTO user_auth (email, password_hash, role, status)
VALUES ('admin@test.com', '$2b$10$YourHashedPasswordHere', 'SUPER_ADMIN', 'ACTIVE');
```

### 2. Se connecter au web admin

1. Ouvrir http://localhost:3001
2. Login: admin@test.com / password
3. Créer votre première saison

### 3. Tester l'app mobile

1. Créer un compte membre
2. Rejoindre un club
3. Accorder les permissions santé
4. Scanner un QR code de test

## 📱 Générer un QR code de test

```bash
# Dans le web admin, aller sur QR Codes
# Sélectionner un club
# Cliquer "Generate QR Code"
# Scanner avec l'app mobile
```

## 🔧 Commandes utiles

```bash
# Logs backend
docker-compose logs -f backend

# Restart un service
docker-compose restart backend

# Rebuild après changements
docker-compose up -d --build

# Stop tout
docker-compose down

# Reset complet (⚠️ supprime données)
docker-compose down -v
```

## 🐛 Problèmes fréquents

**Backend ne démarre pas:**
```bash
# Vérifier que PostgreSQL est lancé
docker-compose ps
# Vérifier les logs
docker-compose logs backend
```

**Port déjà utilisé:**
```bash
# Changer les ports dans docker-compose.yml
ports:
  - "3001:3000"  # au lieu de 3000:3000
```

**L'app mobile ne se connecte pas:**
```bash
# Vérifier l'URL de l'API dans mobile-app/src/api/client.ts
# Pour iOS simulator: http://localhost:3000
# Pour Android emulator: http://10.0.2.2:3000
# Pour device physique: http://<your-local-ip>:3000
```

## 📚 Prochaines étapes

1. Lire la [Documentation Technique](./docs/TECHNICAL_DOCUMENTATION.md)
2. Configurer les jobs cron
3. Importer vos clubs et membres (CSV)
4. Créer votre première saison
5. Tester le scoring

## 🆘 Besoin d'aide ?

- Documentation complète: `/docs/TECHNICAL_DOCUMENTATION.md`
- Issues GitHub: (à définir)
- Email: support@yourplatform.com
