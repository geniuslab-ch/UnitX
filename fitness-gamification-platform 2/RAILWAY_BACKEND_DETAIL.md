# 🔧 Guide ULTRA-DÉTAILLÉ - Configuration Backend sur Railway

## Pour Débutants - Explications Complètes Étape par Étape

Ce guide explique **TOUT EN DÉTAIL** pour configurer le backend. Aucune connaissance préalable nécessaire !

---

## 📍 Où Vous Êtes

Vous avez:
- ✅ Créé un compte GitHub
- ✅ Créé un compte Railway
- ✅ Uploadé votre code sur GitHub
- ✅ Créé un projet sur Railway
- ✅ Ajouté PostgreSQL

**Maintenant:** On va configurer le backend !

---

# 🎯 PARTIE 1: Créer le Service Backend

## Étape 1.1 - Accéder à Votre Projet

1. **Allez sur** https://railway.app/dashboard
2. **Vous voyez** votre projet (ex: "unitx-fitness-platform")
3. **Cliquez dessus** pour l'ouvrir

```
┌─────────────────────────────────────┐
│  Railway Dashboard                  │
│                                     │
│  Mes Projets:                       │
│  ┌─────────────────────────────┐   │
│  │ 📦 unitx-fitness-platform   │   │ ← CLIQUEZ ICI
│  │ Created today               │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Étape 1.2 - Vue du Projet

Vous êtes maintenant **DANS** votre projet. Vous voyez:

```
┌─────────────────────────────────────────────────┐
│  unitx-fitness-platform                         │
│                                                 │
│  Services actuels:                              │
│  ┌──────────────┐                              │
│  │ 🐘 Postgres  │                              │
│  │ Running      │                              │
│  └──────────────┘                              │
└─────────────────────────────────────────────────┘
```

Pour l'instant, vous avez **seulement** PostgreSQL.

## Étape 1.3 - Ajouter le Service Backend

1. **Cherchez** le bouton "New" ou "+ New Service" (en haut à droite)
2. **Cliquez dessus**

```
┌─────────────────────────────────────┐
│  [+ New]  [Settings]  [...]         │ ← CLIQUEZ ICI
└─────────────────────────────────────┘
```

3. Un menu apparaît avec plusieurs options:

```
┌─────────────────────────────────────┐
│  What would you like to add?        │
│                                     │
│  📦 GitHub Repo                     │ ← CHOISISSEZ CELLE-CI
│  🗄️  Database                       │
│  📝 Empty Service                   │
│  🔗 Template                        │
└─────────────────────────────────────┘
```

4. **Cliquez sur** "GitHub Repo"

## Étape 1.4 - Sélectionner le Repository

1. Railway vous montre vos repositories GitHub:

```
┌─────────────────────────────────────┐
│  Select a repository                │
│                                     │
│  🔍 Search repositories...          │
│                                     │
│  ✓ unitx-fitness-platform           │ ← SÉLECTIONNEZ
│    Updated today                    │
│                                     │
│  [Cancel]  [Deploy]                 │
└─────────────────────────────────────┘
```

2. **Cliquez sur** votre repository "unitx-fitness-platform"
3. **Cliquez sur** "Deploy"

## Étape 1.5 - Configurer le Root Directory

**TRÈS IMPORTANT !** Railway va vous demander où se trouve le backend.

1. Railway affiche:

```
┌─────────────────────────────────────┐
│  Configure Service                  │
│                                     │
│  Name: backend                      │
│                                     │
│  Root Directory:                    │
│  [_________________]                │ ← TAPEZ ICI
│                                     │
│  [Cancel]  [Configure]              │
└─────────────────────────────────────┘
```

2. **Dans "Root Directory"**, tapez exactement:
   ```
   backend
   ```

3. **Cliquez sur** "Configure"

✅ **Le service backend est créé !**

Maintenant, Railway va essayer de builder le backend. **C'est normal que ça échoue** pour l'instant, car on n'a pas encore configuré les variables d'environnement.

---

# 🔐 PARTIE 2: Créer les Secrets (JWT et QR Code)

## Qu'est-ce que JWT_SECRET et QR_CODE_SECRET ?

**Ce sont des "mots de passe"** que votre application utilise pour:
- **JWT_SECRET**: Sécuriser les tokens de connexion (pour que personne ne puisse se faire passer pour un utilisateur)
- **QR_CODE_SECRET**: Sécuriser les QR codes (pour que personne ne puisse créer de faux QR codes)

**Vous pouvez inventer ces secrets vous-même !** Plus ils sont longs et aléatoires, mieux c'est.

## Méthode 1: Générer des Secrets Aléatoires (Recommandé)

### Option A: Avec un Site Web

1. **Allez sur** https://randomkeygen.com/
2. **Copiez** une des clés "Fort Knox Passwords" (elles sont très sécurisées)
3. Utilisez-en une pour JWT_SECRET
4. Copiez-en une autre pour QR_CODE_SECRET

**Exemple de ce que vous pouvez copier:**
```
JWT_SECRET: b8Kn3pQ7mL9xR2wF5vD1hJ6tY4cZ0aS
QR_CODE_SECRET: w9xR3vB7nM2qP5kL8hJ4fD1tY6cZ0aS
```

### Option B: Avec Votre Navigateur (Console)

1. **Ouvrez** votre navigateur
2. **Appuyez sur** F12 (ouvre les outils développeur)
3. **Cliquez sur** l'onglet "Console"
4. **Copiez-collez** cette commande et appuyez sur Entrée:

```javascript
Array(32).fill(0).map(() => Math.random().toString(36).charAt(2)).join('')
```

5. **Copiez** le résultat (c'est votre JWT_SECRET)
6. **Exécutez** la commande à nouveau pour QR_CODE_SECRET

### Option C: Inventer Vous-Même

**Créez une chaîne** d'au moins 32 caractères avec:
- Lettres majuscules et minuscules
- Chiffres
- Symboles (optionnel)

**Exemples:**
```
JWT_SECRET: MonSuperSecret2024PourUnitxJWT999
QR_CODE_SECRET: AutreSecretQRCodeUnitxPlateforme777
```

⚠️ **IMPORTANT:** 
- Ne partagez JAMAIS ces secrets
- Utilisez des valeurs différentes pour JWT et QR
- Notez-les quelque part en sécurité

---

# ⚙️ PARTIE 3: Ajouter les Variables d'Environnement

## Étape 3.1 - Accéder aux Variables

1. **Dans votre projet Railway**, vous voyez maintenant 2 services:

```
┌─────────────────────────────────────┐
│  Services:                          │
│  ┌──────────────┐  ┌──────────────┐│
│  │ 🐘 Postgres  │  │ 📦 backend   ││
│  │ Running      │  │ Building...  ││
│  └──────────────┘  └──────────────┘│
└─────────────────────────────────────┘
```

2. **Cliquez sur** le service "backend"

3. **En haut**, vous voyez plusieurs onglets:

```
┌─────────────────────────────────────┐
│  Deployments  Variables  Settings   │ ← CLIQUEZ SUR "Variables"
└─────────────────────────────────────┘
```

4. **Cliquez sur** "Variables"

## Étape 3.2 - Interface des Variables

Vous voyez maintenant:

```
┌─────────────────────────────────────────────┐
│  Environment Variables                      │
│                                             │
│  [+ New Variable]                           │ ← BOUTON À CLIQUER
│                                             │
│  No variables yet                           │
└─────────────────────────────────────────────┘
```

## Étape 3.3 - Ajouter Chaque Variable

**On va ajouter TOUTES les variables une par une.**

### VARIABLE 1: DATABASE_URL (Spéciale !)

1. **Cliquez sur** "+ New Variable"
2. Vous voyez:

```
┌─────────────────────────────────────┐
│  Add Variable                       │
│                                     │
│  Variable Name:                     │
│  [_____________________]            │
│                                     │
│  Variable Value:                    │
│  [_____________________]            │
│                                     │
│  [Reference] [Add]                  │
└─────────────────────────────────────┘
```

3. **Dans "Variable Name"**, tapez:
   ```
   DATABASE_URL
   ```

4. **IMPORTANT:** Pour cette variable, **NE TAPEZ RIEN dans "Variable Value"** !

5. **À la place**, cliquez sur le bouton **"Reference"** (à côté de Add)

6. Un nouveau menu apparaît:

```
┌─────────────────────────────────────┐
│  Add Reference                      │
│                                     │
│  Service: [Choisir...]              │
│  Variable: [Choisir...]             │
│                                     │
│  [Cancel] [Add]                     │
└─────────────────────────────────────┘
```

7. **Dans "Service"**, sélectionnez: **Postgres** (ou le nom de votre base de données)

8. **Dans "Variable"**, sélectionnez: **DATABASE_URL**

9. **Cliquez sur** "Add"

✅ **DATABASE_URL est configurée !** Railway va automatiquement utiliser l'URL de votre base de données.

### VARIABLE 2: JWT_SECRET

1. **Cliquez sur** "+ New Variable"
2. **Variable Name:** `JWT_SECRET`
3. **Variable Value:** Collez votre secret généré (ex: `b8Kn3pQ7mL9xR2wF5vD1hJ6tY4cZ0aS`)
4. **Cliquez sur** "Add"

✅ **JWT_SECRET configuré !**

### VARIABLE 3: QR_CODE_SECRET

1. **Cliquez sur** "+ New Variable"
2. **Variable Name:** `QR_CODE_SECRET`
3. **Variable Value:** Collez votre autre secret (ex: `w9xR3vB7nM2qP5kL8hJ4fD1tY6cZ0aS`)
4. **Cliquez sur** "Add"

✅ **QR_CODE_SECRET configuré !**

### VARIABLE 4: NODE_ENV

1. **Cliquez sur** "+ New Variable"
2. **Variable Name:** `NODE_ENV`
3. **Variable Value:** `production`
4. **Cliquez sur** "Add"

### VARIABLE 5: PORT

1. **Cliquez sur** "+ New Variable"
2. **Variable Name:** `PORT`
3. **Variable Value:** `3000`
4. **Cliquez sur** "Add"

### VARIABLE 6: CORS_ORIGIN (On va laisser vide pour l'instant)

**On configurera celle-ci APRÈS avoir créé le frontend.**

Pour l'instant, créez-la avec une valeur temporaire:

1. **Cliquez sur** "+ New Variable"
2. **Variable Name:** `CORS_ORIGIN`
3. **Variable Value:** `*` (pour accepter tout temporairement)
4. **Cliquez sur** "Add"

### VARIABLES 7-13: Les Règles de Scoring

**Ajoutez ces variables une par une** (même méthode: + New Variable):

| Variable Name | Variable Value | Explication |
|--------------|----------------|-------------|
| `CHECKIN_POINTS` | `50` | Points gagnés par check-in |
| `CALORIES_POINTS_DIVISOR` | `10` | 1 point par X calories |
| `MAX_CALORIES_POINTS_PER_DAY` | `150` | Maximum de points calories/jour |
| `STREAK_BONUS_POINTS` | `20` | Bonus pour série de jours |
| `STREAK_DAYS_REQUIRED` | `3` | Nombre de jours pour le bonus |
| `TOP_N_CONTRIBUTORS` | `50` | Top contributeurs à considérer |
| `MAX_CALORIES_PER_DAY` | `2500` | Maximum calories/jour (anti-cheat) |

**Pour chaque variable:**
1. Cliquez "+ New Variable"
2. Tapez le nom (ex: `CHECKIN_POINTS`)
3. Tapez la valeur (ex: `50`)
4. Cliquez "Add"
5. Passez à la suivante

### VARIABLES 14-15: Rate Limiting (Optionnel mais recommandé)

| Variable Name | Variable Value |
|--------------|----------------|
| `RATE_LIMIT_MAX` | `100` |
| `RATE_LIMIT_WINDOW` | `15` |

### VARIABLE 16: QR_ROTATION_MINUTES

| Variable Name | Variable Value |
|--------------|----------------|
| `QR_ROTATION_MINUTES` | `5` |

## Étape 3.4 - Vérifier Vos Variables

Maintenant, vous devriez voir **toutes vos variables** listées:

```
┌─────────────────────────────────────────────┐
│  Environment Variables                      │
│                                             │
│  [+ New Variable]                           │
│                                             │
│  DATABASE_URL = ${{Postgres.DATABASE_URL}}  │
│  JWT_SECRET = b8Kn3pQ7mL9x... (hidden)     │
│  QR_CODE_SECRET = w9xR3vB7nM2q... (hidden) │
│  NODE_ENV = production                      │
│  PORT = 3000                                │
│  CORS_ORIGIN = *                            │
│  CHECKIN_POINTS = 50                        │
│  CALORIES_POINTS_DIVISOR = 10               │
│  MAX_CALORIES_POINTS_PER_DAY = 150          │
│  STREAK_BONUS_POINTS = 20                   │
│  STREAK_DAYS_REQUIRED = 3                   │
│  TOP_N_CONTRIBUTORS = 50                    │
│  MAX_CALORIES_PER_DAY = 2500                │
│  RATE_LIMIT_MAX = 100                       │
│  RATE_LIMIT_WINDOW = 15                     │
│  QR_ROTATION_MINUTES = 5                    │
└─────────────────────────────────────────────┘
```

✅ **Toutes les variables sont configurées !**

---

# 🚀 PARTIE 4: Redéployer le Backend

## Étape 4.1 - Lancer le Déploiement

Maintenant que les variables sont configurées, on va redéployer:

1. **Cliquez sur** l'onglet "Deployments" (en haut)

```
┌─────────────────────────────────────┐
│  Deployments  Variables  Settings   │ ← CLIQUEZ SUR "Deployments"
└─────────────────────────────────────┘
```

2. **Cliquez sur** "Deploy" ou "Redeploy" (bouton en haut à droite)

3. Railway va:
   - ✅ Builder votre code backend
   - ✅ Créer un container Docker
   - ✅ Démarrer le serveur
   - ✅ Se connecter à PostgreSQL

**Attendez 3-5 minutes.**

## Étape 4.2 - Suivre les Logs

Vous pouvez voir ce qui se passe en temps réel:

1. **Cliquez sur** le déploiement en cours
2. **Vous voyez** les logs défiler:

```
Building...
Installing dependencies...
Compiling TypeScript...
Starting server...
✓ Connected to PostgreSQL
✓ Server listening on port 3000
```

**Si vous voyez "✓ Server listening", c'est bon !** ✅

## Étape 4.3 - Obtenir l'URL du Backend

1. **Allez dans** "Settings" (onglet en haut)
2. **Cherchez** "Networking" ou "Domains"
3. **Activez** "Generate Domain" (si pas déjà fait)
4. **Copiez** l'URL générée (ex: `https://backend-production-abc123.up.railway.app`)

**Notez cette URL quelque part ! Vous en aurez besoin pour le frontend.**

---

# 📋 Résumé Complet

Vous avez maintenant:

✅ **Service backend créé** dans Railway  
✅ **Root directory** configuré (`backend`)  
✅ **16 variables d'environnement** ajoutées:
- DATABASE_URL (référence à PostgreSQL)
- JWT_SECRET (votre secret inventé)
- QR_CODE_SECRET (votre autre secret)
- NODE_ENV = production
- PORT = 3000
- CORS_ORIGIN = * (temporaire)
- + 10 autres variables de configuration

✅ **Backend déployé** et en cours d'exécution  
✅ **URL publique** du backend obtenue  

---

# 🔄 Prochaine Étape

**Maintenant, passez à la configuration du Frontend !**

Vous aurez besoin de l'URL du backend que vous venez de copier.

---

# 🆘 Problèmes Fréquents

### Le build échoue

**Vérifiez:**
1. Que le "Root Directory" est bien `backend`
2. Que toutes les variables sont bien ajoutées
3. Les logs pour voir l'erreur exacte

### "Cannot connect to database"

**Vérifiez:**
1. Que DATABASE_URL est une "Reference" vers Postgres (pas une valeur tapée manuellement)
2. Que le service Postgres est bien "Running"

### "Port already in use"

**Solution:**
- Railway gère les ports automatiquement
- Assurez-vous que PORT = 3000 dans les variables

### Secrets trop courts

**Si Railway refuse vos secrets:**
- Générez-en de plus longs (au moins 32 caractères)
- Utilisez https://randomkeygen.com/

---

**Vous êtes prêt ! Passez maintenant à la configuration du Frontend ! 🎨**
