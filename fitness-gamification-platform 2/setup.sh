#!/bin/bash

echo "🚀 UNITX Fitness Gamification - Setup Automatique"
echo "=================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier qu'on est dans le bon dossier
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Erreur: Veuillez lancer ce script depuis le dossier fitness-gamification-platform/"
    exit 1
fi

echo "${BLUE}Étape 1/4: Création du fichier .env pour le backend...${NC}"

# Backend .env
cat > backend/.env << 'EOF'
# Base de données
DATABASE_URL=postgresql://postgres:password123@postgres:5432/fitness_db

# Sécurité (CHANGEZ CES VALEURS EN PRODUCTION!)
JWT_SECRET=votre-super-secret-tres-long-changez-moi-123456789
QR_CODE_SECRET=un-autre-secret-pour-qr-codes-789456123

# Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

# Règles de scoring
CHECKIN_POINTS=50
CALORIES_POINTS_DIVISOR=10
MAX_CALORIES_POINTS_PER_DAY=150
STREAK_BONUS_POINTS=20
STREAK_DAYS_REQUIRED=3
TOP_N_CONTRIBUTORS=50

# Anti-cheat
MAX_CALORIES_PER_DAY=2500
QR_ROTATION_MINUTES=5

# Rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15

# Logs
LOG_LEVEL=info
EOF

echo "${GREEN}✅ Fichier backend/.env créé${NC}"
echo ""

echo "${BLUE}Étape 2/4: Création du fichier .env pour le frontend...${NC}"

# Frontend .env
cat > web-admin/.env << 'EOF'
VITE_API_URL=http://localhost:3000/api/v1
VITE_ENV=development
EOF

echo "${GREEN}✅ Fichier web-admin/.env créé${NC}"
echo ""

echo "${BLUE}Étape 3/4: Vérification de Docker...${NC}"

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "${YELLOW}⚠️  Docker n'est pas installé${NC}"
    echo "Veuillez installer Docker Desktop depuis: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Vérifier si Docker est en cours d'exécution
if ! docker info &> /dev/null; then
    echo "${YELLOW}⚠️  Docker n'est pas démarré${NC}"
    echo "Veuillez démarrer Docker Desktop et relancer ce script"
    exit 1
fi

echo "${GREEN}✅ Docker est installé et en cours d'exécution${NC}"
echo ""

echo "${BLUE}Étape 4/4: Informations importantes${NC}"
echo ""
echo "📋 Configuration complète :"
echo "   • Backend API : http://localhost:3000"
echo "   • Frontend UNITX : http://localhost:3001"
echo "   • PostgreSQL : localhost:5432"
echo ""
echo "🔐 Identifiants de connexion (après avoir créé l'utilisateur) :"
echo "   • Email : admin@unitx.com"
echo "   • Password : admin123"
echo ""
echo "${GREEN}✅ Setup terminé avec succès !${NC}"
echo ""
echo "📝 Prochaines étapes :"
echo ""
echo "1️⃣  Lancer l'application :"
echo "   ${YELLOW}docker-compose up -d${NC}"
echo ""
echo "2️⃣  Créer l'utilisateur admin :"
echo "   ${YELLOW}docker-compose exec postgres psql -U postgres -d fitness_db -c \"INSERT INTO members (id, email, password_hash, first_name, last_name, role, status, created_at) VALUES (gen_random_uuid(), 'admin@unitx.com', '\\$2b\\$10\\$rOYEj0EqN5J5qHJH5qH5qeeYqN5J5qHJH5qH5qeeYqN5J5qHJH5qO', 'Admin', 'UNITX', 'SUPER_ADMIN', 'ACTIVE', NOW());\"${NC}"
echo ""
echo "3️⃣  Ouvrir dans le navigateur :"
echo "   ${YELLOW}http://localhost:3001${NC}"
echo ""
echo "Pour plus d'aide, consultez GUIDE_DEPLOIEMENT_DEBUTANT.md"
echo ""
