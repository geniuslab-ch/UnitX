# 🌐 Guide Déploiement en Ligne ULTRA-SIMPLE - Railway

## Pour Débutants - Déploiement Gratuit en 15 Minutes

Ce guide vous explique comment mettre votre plateforme UNITX **en ligne** et **accessible depuis n'importe où**, sans avoir besoin de place sur votre ordinateur !

---

## 💰 Coût

- **Gratuit** pour commencer (Railway offre 500h/mois gratuites)
- Après la période gratuite : **~5-10€/mois**
- Pas de carte de crédit requise pour débuter

---

## 🎯 Ce Dont Vous Avez Besoin

- ✅ Une adresse email
- ✅ Un compte GitHub (gratuit)
- ✅ 15 minutes de votre temps
- ❌ **Pas besoin d'espace disque sur votre ordinateur !**

---

# 📝 ÉTAPE 1: Créer un Compte GitHub

GitHub va stocker votre code (gratuitement).

### 1.1 - Inscription

1. **Allez sur** https://github.com
2. **Cliquez sur** "Sign up" (en haut à droite)
3. **Remplissez:**
   - Email: votre email
   - Password: choisissez un mot de passe
   - Username: choisissez un nom d'utilisateur (ex: "unitx-fitness")
4. **Cliquez sur** "Create account"
5. **Vérifiez votre email** (cliquez sur le lien reçu)

✅ **Votre compte GitHub est créé !**

---

# 🚂 ÉTAPE 2: Créer un Compte Railway

Railway va héberger votre application (gratuit pour commencer).

### 2.1 - Inscription avec GitHub

1. **Allez sur** https://railway.app
2. **Cliquez sur** "Login" (en haut à droite)
3. **Cliquez sur** "Login with GitHub"
4. **Autorisez Railway** à accéder à votre GitHub
5. **Choisissez un nom** pour votre workspace (ex: "UNITX Platform")

✅ **Votre compte Railway est créé !**

---

# 📤 ÉTAPE 3: Uploader Votre Code sur GitHub

On va mettre votre code sur GitHub directement depuis l'interface web (pas besoin de ligne de commande !).

### 3.1 - Télécharger et Extraire l'Archive

1. **Téléchargez** `fitness-gamification-platform-complete.tar.gz`
2. **Extrayez** l'archive (double-clic ou 7-Zip)
3. Vous avez maintenant un dossier `fitness-gamification-platform`

### 3.2 - Créer un Nouveau Repository GitHub

1. **Allez sur** https://github.com
2. **Cliquez sur** le "+" en haut à droite
3. **Choisissez** "New repository"
4. **Remplissez:**
   - Repository name: `unitx-fitness-platform`
   - Description: "UNITX Fitness Gamification Platform"
   - ✅ Cochez "Public" (ou Private si vous préférez)
   - ✅ **NE COCHEZ PAS** "Add a README file"
5. **Cliquez sur** "Create repository"

### 3.3 - Upload des Fichiers

**Méthode Simple (via navigateur):**

1. Sur la page de votre nouveau repository
2. **Cliquez sur** "uploading an existing file"
3. **Glissez-déposez** TOUT le contenu du dossier `fitness-gamification-platform` dans la zone
   - Sélectionnez tous les dossiers et fichiers
   - Faites-les glisser dans le navigateur
4. **Attendez** que tous les fichiers soient uploadés (ça peut prendre 2-3 minutes)
5. En bas, dans "Commit changes":
   - Message: "Initial commit - UNITX Platform"
6. **Cliquez sur** "Commit changes"

✅ **Votre code est maintenant sur GitHub !**

---

# 🚀 ÉTAPE 4: Déployer sur Railway

Maintenant on va mettre tout ça en ligne !

### 4.1 - Créer un Nouveau Projet

1. **Allez sur** https://railway.app/dashboard
2. **Cliquez sur** "New Project"
3. **Choisissez** "Deploy from GitHub repo"
4. **Sélectionnez** votre repository `unitx-fitness-platform`
5. Railway détecte automatiquement que c'est un projet Docker

### 4.2 - Configuration de la Base de Données

1. Dans votre projet Railway
2. **Cliquez sur** "New" (en haut à droite)
3. **Choisissez** "Database"
4. **Sélectionnez** "Add PostgreSQL"
5. Railway crée automatiquement une base de données

✅ **Base de données créée !**

### 4.3 - Configurer les Services

Railway va déployer 2 services :
- **Backend** (l'API)
- **Frontend** (l'interface UNITX)

#### A. Configurer le Backend

1. **Cliquez sur** le service "backend" (ou créez-le)
2. **Allez dans** "Settings"
3. **Trouvez** "Environment Variables"
4. **Ajoutez ces variables** (cliquez sur "New Variable" pour chaque):

**Variables à ajouter :**

```
DATABASE_URL
```
- Valeur: Cliquez sur "Add Reference" → Choisissez PostgreSQL → DATABASE_URL

```
JWT_SECRET
```
- Valeur: `votre-super-secret-tres-long-changez-moi-123456789`

```
QR_CODE_SECRET
```
- Valeur: `un-autre-secret-pour-qr-codes-789456123`

```
NODE_ENV
```
- Valeur: `production`

```
PORT
```
- Valeur: `3000`

```
CORS_ORIGIN
```
- Valeur: On la mettra après (l'URL du frontend)

```
CHECKIN_POINTS
```
- Valeur: `50`

```
CALORIES_POINTS_DIVISOR
```
- Valeur: `10`

```
MAX_CALORIES_POINTS_PER_DAY
```
- Valeur: `150`

```
STREAK_BONUS_POINTS
```
- Valeur: `20`

```
STREAK_DAYS_REQUIRED
```
- Valeur: `3`

```
TOP_N_CONTRIBUTORS
```
- Valeur: `50`

```
MAX_CALORIES_PER_DAY
```
- Valeur: `2500`

```
QR_ROTATION_MINUTES
```
- Valeur: `5`

5. **Allez dans** "Settings" → "Networking"
6. **Activez** "Public Networking"
7. **Copiez** l'URL générée (ex: `https://backend-production-xxxx.up.railway.app`)

#### B. Configurer le Frontend

1. **Cliquez sur** "New" → "GitHub Repo"
2. **Sélectionnez** votre repo
3. **Dans Root Directory**, tapez: `web-admin`
4. **Allez dans** "Settings"
5. **Environment Variables**, ajoutez:

```
VITE_API_URL
```
- Valeur: L'URL de votre backend + `/api/v1`
- Exemple: `https://backend-production-xxxx.up.railway.app/api/v1`

```
VITE_ENV
```
- Valeur: `production`

6. **Allez dans** "Settings" → "Networking"
7. **Activez** "Public Networking"
8. **Copiez** l'URL générée (ex: `https://web-admin-production-xxxx.up.railway.app`)

#### C. Mettre à Jour CORS dans le Backend

1. **Retournez** dans le service Backend
2. **Variables d'environnement**
3. **Modifiez** `CORS_ORIGIN`
4. **Mettez** l'URL de votre frontend
   - Exemple: `https://web-admin-production-xxxx.up.railway.app`
5. **Sauvegardez**

### 4.4 - Déployer

Railway va automatiquement:
- ✅ Builder votre code
- ✅ Créer les containers Docker
- ✅ Démarrer les services
- ✅ Les mettre en ligne

**Attendez 5-10 minutes** que tout se déploie.

Vous pouvez suivre les logs en temps réel en cliquant sur chaque service.

---

# 🎉 ÉTAPE 5: Créer Votre Premier Utilisateur

### 5.1 - Accéder à la Base de Données

1. **Dans Railway**, cliquez sur votre service PostgreSQL
2. **Allez dans** "Data" ou "Query"
3. Vous pouvez exécuter des commandes SQL directement

### 5.2 - Créer l'Utilisateur Admin

**Copiez-collez cette commande SQL** dans l'interface Railway:

```sql
INSERT INTO members (
  id, 
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  status, 
  created_at
) VALUES (
  gen_random_uuid(),
  'admin@unitx.com',
  '$2b$10$rOYEj0EqN5J5qHJH5qH5qeeYqN5J5qHJH5qH5qeeYqN5J5qHJH5qO',
  'Admin',
  'UNITX',
  'SUPER_ADMIN',
  'ACTIVE',
  NOW()
);
```

**Cliquez sur** "Execute" ou "Run"

✅ **Utilisateur admin créé !**

---

# 🌐 ÉTAPE 6: Accéder à Votre Application

### 6.1 - Ouvrir le Frontend

1. **Copiez** l'URL de votre service web-admin
   - Exemple: `https://web-admin-production-xxxx.up.railway.app`
2. **Ouvrez-la** dans votre navigateur

🎨 **Vous devriez voir la page de login UNITX !**

### 6.2 - Se Connecter

**Identifiants:**
- Email: `admin@unitx.com`
- Password: `admin123`

🎉 **VOUS ÊTES CONNECTÉ !**

Votre plateforme UNITX est maintenant **en ligne** et **accessible depuis partout** ! 🚀

---

# 📱 ÉTAPE 7: Partager l'URL

Vous pouvez maintenant partager l'URL avec qui vous voulez:

**URL de votre plateforme:**
```
https://web-admin-production-xxxx.up.railway.app
```

Tout le monde peut y accéder !

---

# 🎨 BONUS: Personnaliser l'URL (Optionnel)

### Avec un Nom de Domaine Personnalisé

Si vous voulez `unitx.votredomaine.com` au lieu de l'URL Railway:

1. **Achetez un domaine** (ex: sur Namecheap, OVH, Google Domains) ~10€/an
2. **Dans Railway**, allez dans Settings → Domains
3. **Cliquez sur** "Add Custom Domain"
4. **Tapez** votre domaine (ex: `app.unitx.com`)
5. **Suivez les instructions** pour configurer le DNS

---

# 🔧 Configuration Avancée (Optionnel)

### Configurer les Emails

Si vous voulez envoyer des emails (notifications, reset password):

1. **Dans le service Backend** → Variables
2. **Ajoutez:**

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
```

**Pour Gmail:**
- Activez l'authentification 2 facteurs
- Générez un "mot de passe d'application"
- Utilisez ce mot de passe dans `SMTP_PASS`

---

# 📊 Surveiller Votre Application

### Voir les Logs

1. **Dans Railway**, cliquez sur un service
2. **Allez dans** "Deployments"
3. **Cliquez sur** la dernière deployment
4. Vous voyez les logs en temps réel

### Voir les Métriques

1. **Cliquez sur** "Metrics" dans un service
2. Vous voyez:
   - CPU usage
   - Memory usage
   - Network usage

---

# 💰 Tarification Railway

### Plan Gratuit (Trial)
- ✅ 500 heures d'exécution/mois
- ✅ 512 MB RAM
- ✅ 1 GB disque
- ✅ Parfait pour tester !

### Plan Hobby (5$/mois)
- ✅ Exécution illimitée
- ✅ 8 GB RAM
- ✅ 100 GB disque
- ✅ Pour usage réel

**Calcul:** Avec le plan gratuit, vous avez ~20 jours d'utilisation continue gratuite.

---

# 🆘 Problèmes Fréquents

### Build Failed

**Solution:**
1. Vérifiez les logs de build
2. Assurez-vous que tous les fichiers sont bien uploadés sur GitHub
3. Vérifiez que `Dockerfile` est à la racine de backend/ et web-admin/

### Cannot Connect to Database

**Solution:**
1. Vérifiez que la variable `DATABASE_URL` est bien configurée
2. Utilisez "Add Reference" pour lier automatiquement à PostgreSQL

### CORS Error

**Solution:**
1. Vérifiez que `CORS_ORIGIN` dans le backend contient l'URL du frontend
2. Redéployez le backend après modification

### 500 Internal Server Error

**Solution:**
1. Regardez les logs du backend
2. Vérifiez que toutes les variables d'environnement sont configurées
3. Vérifiez que la base de données a bien les tables (schema.sql)

### Logo UNITX ne s'affiche pas

**Solution:**
1. Vérifiez que le fichier `logo.png` est dans `web-admin/public/`
2. Videz le cache du navigateur (Ctrl+Shift+R)
3. Redéployez le frontend

---

# 🔄 Faire des Mises à Jour

### Méthode Simple (via GitHub web)

1. **Allez sur** votre repository GitHub
2. **Naviguez** vers le fichier à modifier
3. **Cliquez sur** l'icône crayon (Edit)
4. **Faites vos modifications**
5. **Cliquez sur** "Commit changes"
6. **Railway redéploie automatiquement** !

---

# 📋 Checklist Finale

Cochez quand c'est fait:

- [ ] Compte GitHub créé
- [ ] Compte Railway créé
- [ ] Code uploadé sur GitHub
- [ ] Projet Railway créé
- [ ] PostgreSQL ajouté
- [ ] Backend configuré et déployé
- [ ] Frontend configuré et déployé
- [ ] CORS configuré
- [ ] Utilisateur admin créé
- [ ] Connexion réussie
- [ ] Dashboard UNITX visible en ligne ! 🎉

---

# 🎓 Commandes Utiles (Via Railway Interface)

### Redémarrer un Service
1. Cliquez sur le service
2. Settings → Redeploy

### Voir la Base de Données
1. Cliquez sur PostgreSQL
2. Data → Vous voyez toutes les tables

### Exécuter du SQL
1. PostgreSQL → Query
2. Tapez votre commande SQL
3. Execute

---

# 🌟 Alternatives à Railway

Si Railway ne vous convient pas, voici d'autres options simples:

### Render.com (Gratuit aussi)
- Interface similaire
- Très simple
- Plan gratuit plus généreux
- Guide: https://render.com/docs

### Heroku (7$/mois minimum)
- Plus ancien
- Très stable
- Plus cher
- Guide: https://devcenter.heroku.com

### Fly.io (Gratuit pour commencer)
- Très rapide
- Un peu plus technique
- Guide: https://fly.io/docs

---

# 📞 Besoin d'Aide ?

### Ressources

1. **Documentation Railway:** https://docs.railway.app
2. **Community Railway:** https://discord.gg/railway
3. **GitHub Guides:** https://guides.github.com

### En Cas de Blocage

1. **Vérifiez les logs** dans Railway
2. **Cherchez l'erreur** sur Google
3. **Consultez** la documentation Railway
4. **Demandez** sur le Discord de Railway (très réactif !)

---

# 🎉 Félicitations !

Vous avez maintenant:
- ✅ Une plateforme UNITX **en ligne**
- ✅ Accessible depuis **n'importe où**
- ✅ Avec une **vraie base de données**
- ✅ **Gratuit** pour commencer
- ✅ **Professionnel** et **scalable**

**Votre URL:**
```
https://web-admin-production-xxxx.up.railway.app
```

Vous pouvez la partager avec vos clubs, membres, et commencer à utiliser la plateforme ! 🚀🎨

---

**Temps total estimé:** 15-20 minutes  
**Coût:** Gratuit (500h/mois)  
**Niveau de difficulté:** ⭐⭐ (Facile)

**Bon déploiement ! Profitez de votre plateforme UNITX en ligne ! 🌐✨**
