@echo off
chcp 65001 >nul
color 0A

echo.
echo ========================================
echo 🚀 UNITX Fitness Gamification Setup
echo ========================================
echo.

REM Vérifier qu'on est dans le bon dossier
if not exist "docker-compose.yml" (
    echo ❌ Erreur: Veuillez lancer ce script depuis le dossier fitness-gamification-platform\
    pause
    exit /b 1
)

echo [Étape 1/4] Création du fichier .env pour le backend...
echo.

REM Backend .env
(
echo DATABASE_URL=postgresql://postgres:password123@postgres:5432/fitness_db
echo.
echo JWT_SECRET=votre-super-secret-tres-long-changez-moi-123456789
echo QR_CODE_SECRET=un-autre-secret-pour-qr-codes-789456123
echo.
echo NODE_ENV=development
echo PORT=3000
echo CORS_ORIGIN=http://localhost:3001
echo.
echo CHECKIN_POINTS=50
echo CALORIES_POINTS_DIVISOR=10
echo MAX_CALORIES_POINTS_PER_DAY=150
echo STREAK_BONUS_POINTS=20
echo STREAK_DAYS_REQUIRED=3
echo TOP_N_CONTRIBUTORS=50
echo.
echo MAX_CALORIES_PER_DAY=2500
echo QR_ROTATION_MINUTES=5
echo.
echo RATE_LIMIT_MAX=100
echo RATE_LIMIT_WINDOW=15
echo.
echo LOG_LEVEL=info
) > backend\.env

echo ✅ Fichier backend\.env créé
echo.

echo [Étape 2/4] Création du fichier .env pour le frontend...
echo.

REM Frontend .env
(
echo VITE_API_URL=http://localhost:3000/api/v1
echo VITE_ENV=development
) > web-admin\.env

echo ✅ Fichier web-admin\.env créé
echo.

echo [Étape 3/4] Vérification de Docker...
echo.

REM Vérifier si Docker est installé
docker --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Docker n'est pas installé
    echo.
    echo Veuillez installer Docker Desktop depuis:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

REM Vérifier si Docker est en cours d'exécution
docker info >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Docker n'est pas démarré
    echo.
    echo Veuillez démarrer Docker Desktop et relancer ce script
    echo.
    pause
    exit /b 1
)

echo ✅ Docker est installé et en cours d'exécution
echo.

echo [Étape 4/4] Informations importantes
echo.
echo ========================================
echo 📋 Configuration complète
echo ========================================
echo.
echo • Backend API : http://localhost:3000
echo • Frontend UNITX : http://localhost:3001
echo • PostgreSQL : localhost:5432
echo.
echo ========================================
echo 🔐 Identifiants (après création)
echo ========================================
echo.
echo • Email : admin@unitx.com
echo • Password : admin123
echo.
echo ========================================
echo ✅ Setup terminé avec succès !
echo ========================================
echo.
echo 📝 PROCHAINES ÉTAPES :
echo.
echo 1️⃣  Lancer l'application :
echo    docker-compose up -d
echo.
echo 2️⃣  Créer l'utilisateur admin :
echo    docker-compose exec postgres psql -U postgres -d fitness_db -c "INSERT INTO members (id, email, password_hash, first_name, last_name, role, status, created_at) VALUES (gen_random_uuid(), 'admin@unitx.com', '$2b$10$rOYEj0EqN5J5qHJH5qH5qeeYqN5J5qHJH5qH5qeeYqN5J5qHJH5qO', 'Admin', 'UNITX', 'SUPER_ADMIN', 'ACTIVE', NOW());"
echo.
echo 3️⃣  Ouvrir dans le navigateur :
echo    http://localhost:3001
echo.
echo Pour plus d'aide, consultez GUIDE_DEPLOIEMENT_DEBUTANT.md
echo.
pause
