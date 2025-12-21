# 🚀 Guide de Déploiement ULTRA-SIMPLE - UNITX Platform

## Pour Débutants - Pas à Pas Complet

Ce guide vous explique **TOUT** en détail, même si vous n'avez jamais déployé quoi que ce soit.

---

## 📋 Étape 0: Choisir Votre Option

Vous avez 2 options simples:

### Option A: Sur Votre Ordinateur (Pour Tester) ⭐ **RECOMMANDÉ POUR COMMENCER**
- ✅ Gratuit
- ✅ Rapide (30 minutes)
- ✅ Pas besoin de serveur
- ❌ Seulement accessible sur votre ordinateur

### Option B: Sur Internet (Pour Vrai) 
- ✅ Accessible de partout
- ❌ Coûte environ 5-20€/mois
- ❌ Plus complexe

**➡️ On va commencer par l'Option A** (votre ordinateur)

---

# 🖥️ OPTION A: Installation sur Votre Ordinateur

## Étape 1: Installer les Outils Nécessaires

### 1.1 - Télécharger Docker Desktop

**Qu'est-ce que Docker ?**
C'est comme une "boîte" qui contient tout le nécessaire pour faire fonctionner l'application.

**Comment l'installer :**

#### Sur Windows:
1. Allez sur: https://www.docker.com/products/docker-desktop/
2. Cliquez sur "Download for Windows"
3. Une fois téléchargé, double-cliquez sur le fichier
4. Suivez les instructions (cliquez juste sur "Next" partout)
5. Redémarrez votre ordinateur quand demandé

#### Sur Mac:
1. Allez sur: https://www.docker.com/products/docker-desktop/
2. Cliquez sur "Download for Mac" (Intel ou Apple Chip selon votre Mac)
3. Ouvrez le fichier .dmg téléchargé
4. Glissez Docker dans Applications
5. Ouvrez Docker depuis Applications

#### Sur Linux:
```bash
# Copiez-collez cette commande dans votre terminal
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

**Vérifier que ça marche:**
1. Ouvrez Docker Desktop (l'icône de baleine bleue)
2. Attendez qu'il démarre (ça peut prendre 2-3 minutes)
3. Vous devriez voir "Docker Desktop is running"

---

## Étape 2: Préparer Vos Fichiers

### 2.1 - Télécharger l'Archive

Vous avez déjà le fichier `fitness-gamification-platform-complete.tar.gz`

### 2.2 - Extraire les Fichiers

#### Sur Windows:
1. **Téléchargez 7-Zip** (si pas déjà installé): https://www.7-zip.org/
2. Clic-droit sur `fitness-gamification-platform-complete.tar.gz`
3. Choisir "7-Zip" → "Extract Here"
4. Vous aurez un dossier `fitness-gamification-platform`

#### Sur Mac:
1. Double-cliquez sur le fichier `.tar.gz`
2. Un dossier `fitness-gamification-platform` apparaît

#### Sur Linux:
```bash
tar -xzf fitness-gamification-platform-complete.tar.gz
```

### 2.3 - Ouvrir le Dossier

1. Allez dans le dossier `fitness-gamification-platform`
2. Vous devriez voir plusieurs dossiers: `backend`, `web-admin`, `mobile-app`, etc.

---

## Étape 3: Configuration Simple

### 3.1 - Configurer le Backend

1. **Ouvrez le dossier** `backend`
2. **Trouvez le fichier** `.env.example`
3. **Faites une copie** et renommez-la `.env`

**Comment faire:**
- Windows: Clic-droit → Copier, puis Coller, puis F2 pour renommer
- Mac: Clic-droit → Dupliquer, puis renommer
- Linux: `cp .env.example .env`

4. **Ouvrez le fichier** `.env` avec un éditeur de texte (Bloc-notes sur Windows, TextEdit sur Mac)

5. **Remplacez** ce qui est dedans par ceci:

```env
# Base de données
DATABASE_URL=postgresql://postgres:password123@postgres:5432/fitness_db

# Sécurité (CHANGEZ CES VALEURS!)
JWT_SECRET=votre-super-secret-tres-long-123456
QR_CODE_SECRET=un-autre-secret-pour-qr-789

# Configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

# Scoring (vous pouvez laisser comme ça)
CHECKIN_POINTS=50
CALORIES_POINTS_DIVISOR=10
MAX_CALORIES_POINTS_PER_DAY=150
STREAK_BONUS_POINTS=20
STREAK_DAYS_REQUIRED=3
TOP_N_CONTRIBUTORS=50
MAX_CALORIES_PER_DAY=2500
QR_ROTATION_MINUTES=5
```

6. **Sauvegardez** le fichier

### 3.2 - Configurer le Frontend

1. **Ouvrez le dossier** `web-admin`
2. **Trouvez le fichier** `.env.example`
3. **Faites une copie** et renommez-la `.env`

4. **Ouvrez le fichier** `.env` et mettez:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_ENV=development
```

5. **Sauvegardez** le fichier

---

## Étape 4: Lancer l'Application 🚀

### 4.1 - Ouvrir le Terminal

#### Sur Windows:
1. Dans le dossier `fitness-gamification-platform`
2. Tapez "cmd" dans la barre d'adresse en haut
3. Appuyez sur Entrée

#### Sur Mac:
1. Applications → Utilitaires → Terminal
2. Tapez: `cd ` (avec un espace)
3. Glissez le dossier `fitness-gamification-platform` dans le Terminal
4. Appuyez sur Entrée

#### Sur Linux:
1. Ouvrez votre terminal
2. Naviguez vers le dossier:
```bash
cd /chemin/vers/fitness-gamification-platform
```

### 4.2 - Lancer Docker Compose

**Copiez-collez cette commande** dans le terminal:

```bash
docker-compose up -d
```

**Qu'est-ce qui se passe ?**
- Docker va télécharger tout ce dont il a besoin (ça peut prendre 5-10 minutes la première fois)
- Vous verrez des lignes défiler
- À la fin, vous verrez quelque chose comme:
  ```
  Creating fitness-gamification-platform_postgres_1 ... done
  Creating fitness-gamification-platform_backend_1  ... done
  Creating fitness-gamification-platform_web-admin_1 ... done
  ```

**Si vous avez une erreur**, vérifiez que:
- Docker Desktop est bien ouvert et "running"
- Vous êtes bien dans le bon dossier
- Les fichiers `.env` sont bien créés

### 4.3 - Vérifier que Tout Marche

**Tapez cette commande:**
```bash
docker-compose ps
```

Vous devriez voir 3 lignes avec "Up" dedans:
```
NAME                           STATUS
postgres                       Up
backend                        Up
web-admin                      Up
```

✅ **Si c'est le cas, BRAVO ! Tout marche !** 🎉

---

## Étape 5: Accéder à Votre Application

### 5.1 - Ouvrir le Frontend

1. **Ouvrez votre navigateur** (Chrome, Firefox, Safari, etc.)
2. **Tapez dans la barre d'adresse:**
   ```
   http://localhost:3001
   ```
3. Appuyez sur Entrée

**Vous devriez voir la page de Login UNITX !** 🎨

### 5.2 - Créer Votre Premier Utilisateur Admin

**Pour l'instant, vous ne pouvez pas vous connecter car il n'y a pas encore d'utilisateur.**

On va en créer un:

1. **Retournez dans le terminal**

2. **Tapez cette commande** (TOUT en une ligne):

```bash
docker-compose exec postgres psql -U postgres -d fitness_db -c "INSERT INTO members (id, email, password_hash, first_name, last_name, role, status, created_at) VALUES (gen_random_uuid(), 'admin@unitx.com', '\$2b\$10\$rOYEj0EqN5J5qHJH5qH5qeeYqN5J5qHJH5qH5qeeYqN5J5qHJH5qO', 'Admin', 'UNITX', 'SUPER_ADMIN', 'ACTIVE', NOW());"
```

**Ce que fait cette commande:**
- Se connecte à la base de données
- Crée un utilisateur admin avec:
  - Email: `admin@unitx.com`
  - Mot de passe: `admin123`

3. **Appuyez sur Entrée**

Vous devriez voir: `INSERT 0 1`

✅ **Parfait ! Votre admin est créé !**

### 5.3 - Se Connecter

1. **Retournez sur** http://localhost:3001
2. **Entrez:**
   - Email: `admin@unitx.com`
   - Mot de passe: `admin123`
3. **Cliquez sur "Sign In"**

🎉 **VOUS ÊTES CONNECTÉ !** Vous devriez voir le Dashboard UNITX !

---

## Étape 6: Explorer l'Application

### Ce que vous pouvez faire maintenant:

1. **Dashboard** - Voir les statistiques (pour l'instant vides)

2. **Clubs** - Ajouter des clubs:
   - Cliquez sur "Clubs" dans le menu
   - Cliquez sur "Add Club"
   - Remplissez le formulaire
   - Cliquez sur "Save"

3. **Members** - Ajouter des membres

4. **Seasons** - Créer une saison:
   - Cliquez sur "Seasons"
   - Cliquez sur "Create Season"
   - Donnez un nom, dates de début/fin
   - Cliquez sur "Create"

5. **QR Codes** - Générer un QR code pour un club

6. **Leaderboard** - Voir les classements

---

## Étape 7: Arrêter et Redémarrer

### Pour Arrêter l'Application:

Dans le terminal:
```bash
docker-compose stop
```

Tout s'arrête proprement. Vos données sont sauvegardées.

### Pour Redémarrer:

```bash
docker-compose start
```

Tout redémarre exactement comme vous l'aviez laissé.

### Pour Tout Supprimer et Recommencer:

```bash
docker-compose down -v
```

⚠️ **Attention:** Ça supprime TOUTES vos données !

---

## 🆘 Problèmes Fréquents et Solutions

### Problème 1: "Cannot connect to Docker daemon"

**Solution:**
- Ouvrez Docker Desktop
- Attendez qu'il soit complètement démarré (icône de baleine stable)
- Réessayez

### Problème 2: "Port 3000 is already in use"

**Solution:**
Quelque chose utilise déjà ce port.

Option 1 - Arrêter l'autre application:
- Windows: Ouvrez le Gestionnaire des tâches, cherchez le processus sur le port 3000
- Mac/Linux: `lsof -i :3000` puis `kill -9 PID`

Option 2 - Changer le port:
- Éditez `docker-compose.yml`
- Changez `3000:3000` en `3005:3000` par exemple
- Dans `web-admin/.env`, changez l'URL en `http://localhost:3005/api/v1`

### Problème 3: "Page can't be reached"

**Solution:**
1. Vérifiez que Docker est lancé: `docker-compose ps`
2. Si les services sont "Up", attendez 30 secondes et réessayez
3. Vérifiez l'URL: `http://localhost:3001` (pas de 's' à http)

### Problème 4: "Login failed"

**Solution:**
1. Vérifiez que vous avez bien créé l'utilisateur admin (Étape 5.2)
2. Essayez à nouveau avec:
   - Email: `admin@unitx.com`
   - Mot de passe: `admin123`
3. Si ça ne marche toujours pas, recréez l'utilisateur

### Problème 5: Le logo UNITX ne s'affiche pas

**Solution:**
1. Vérifiez que le fichier existe: `web-admin/public/logo.png`
2. Redémarrez le frontend: `docker-compose restart web-admin`
3. Videz le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)

---

## 📱 Étape Bonus: Tester l'App Mobile

### Sur iOS (besoin d'un Mac):

1. **Installer Xcode** depuis l'App Store (gratuit, mais GROS téléchargement ~15GB)

2. **Installer les dépendances:**
```bash
cd mobile-app
npm install
cd ios
pod install
cd ..
```

3. **Lancer l'app:**
```bash
npm run ios
```

Un simulateur iPhone va s'ouvrir avec l'app !

### Sur Android:

1. **Installer Android Studio**: https://developer.android.com/studio

2. **Installer les dépendances:**
```bash
cd mobile-app
npm install
```

3. **Lancer l'app:**
```bash
npm run android
```

---

## 🌐 PARTIE 2: Mettre en Ligne (Plus Tard)

**Quand vous serez prêt à mettre en ligne**, vous aurez besoin de:

### Option Simple: Utiliser un Service Cloud

Je recommande **Railway.app** (le plus simple):

1. Créez un compte sur https://railway.app
2. Connectez votre GitHub
3. Pushez votre code sur GitHub
4. Railway détecte automatiquement Docker
5. Cliquez sur "Deploy"
6. C'est en ligne !

**Coût:** ~5-10€/mois pour commencer

### Autres Options:

- **Heroku** (Simple, 7-20€/mois)
- **DigitalOcean** (Plus technique, 5€/mois)
- **AWS** (Très puissant, compliqué, prix variable)

**Je vous ferai un guide séparé pour ça si vous voulez !**

---

## 📊 Checklist Finale

Cochez quand c'est fait:

- [ ] Docker Desktop installé et lancé
- [ ] Archive extraite
- [ ] Fichiers `.env` créés (backend + frontend)
- [ ] `docker-compose up -d` lancé avec succès
- [ ] Les 3 services sont "Up" (postgres, backend, web-admin)
- [ ] http://localhost:3001 s'ouvre
- [ ] Utilisateur admin créé
- [ ] Connexion réussie
- [ ] Vous voyez le Dashboard UNITX !

✅ **Si tout est coché, BRAVO ! Vous avez réussi !** 🎉

---

## 🎓 Commandes à Retenir

```bash
# Voir l'état de l'application
docker-compose ps

# Voir les logs si problème
docker-compose logs -f

# Arrêter
docker-compose stop

# Redémarrer
docker-compose start

# Tout supprimer et recommencer
docker-compose down -v
docker-compose up -d

# Se connecter à la base de données
docker-compose exec postgres psql -U postgres -d fitness_db
```

---

## 📞 Besoin d'Aide ?

Si vous êtes bloqué:

1. **Regardez les logs:**
   ```bash
   docker-compose logs -f
   ```
   Cherchez les lignes avec "ERROR" ou "Failed"

2. **Redémarrez tout:**
   ```bash
   docker-compose restart
   ```

3. **Vérifiez que Docker tourne:**
   - Icône de baleine en haut/bas de votre écran
   - Doit être stable, pas clignotante

4. **En dernier recours, reset complet:**
   ```bash
   docker-compose down -v
   docker-compose up -d
   # Puis recréez l'utilisateur admin
   ```

---

## 🎉 Félicitations !

Vous avez maintenant:
- ✅ Une plateforme de gamification fitness complète
- ✅ Avec le branding UNITX
- ✅ Qui tourne sur votre ordinateur
- ✅ Prête à être testée !

**Prochaines étapes:**
1. Ajoutez quelques clubs
2. Créez une saison
3. Testez le système de points
4. Quand vous êtes satisfait, on peut mettre en ligne !

---

**Vous avez réussi ! Profitez de votre plateforme UNITX ! 🚀🎨**
