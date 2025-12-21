# Web Admin - Fitness Gamification Platform

Interface d'administration web pour gérer la plateforme de gamification fitness.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 20+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env

# Démarrer en mode développement
npm run dev
```

L'application sera disponible sur http://localhost:3001

### Build pour production

```bash
# Build
npm run build

# Preview du build
npm run preview
```

## 📁 Structure du projet

```
web-admin/
├── src/
│   ├── api/              # Client API REST
│   ├── components/       # Composants réutilisables
│   │   ├── common/       # Composants génériques
│   │   ├── charts/       # Composants de graphiques
│   │   └── layout/       # Layout et navigation
│   ├── pages/            # Pages de l'application
│   │   ├── auth/         # Pages d'authentification
│   │   ├── clubs/        # Gestion des clubs
│   │   ├── members/      # Gestion des membres
│   │   └── seasons/      # Gestion des saisons
│   ├── stores/           # State management (Zustand)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Fonctions utilitaires
│   ├── App.tsx           # Composant principal
│   ├── main.tsx          # Point d'entrée
│   └── index.css         # Styles globaux
├── public/               # Assets statiques
├── index.html            # Template HTML
├── vite.config.ts        # Configuration Vite
├── tailwind.config.js    # Configuration Tailwind
└── package.json          # Dépendances
```

## 🎨 Technologies

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Styling utilitaire
- **Zustand** - State management simple
- **React Router** - Navigation
- **Recharts** - Graphiques et visualisations
- **Lucide React** - Icônes
- **Axios** - HTTP client

## 📱 Fonctionnalités

### Dashboard
- Vue d'ensemble des statistiques
- Graphiques d'activité hebdomadaire
- Activité récente
- Actions rapides

### Clubs
- Liste des clubs avec recherche
- Import CSV
- Ajout/édition de clubs
- Statistiques par club

### Membres
- Liste des membres avec filtres
- Import CSV
- Statistiques individuelles
- Classements

### Saisons
- Création de saisons
- Configuration des règles
- Suivi de progression
- Gestion du scope (inter-clubs, intra-brand)

### Leaderboard
- Classement temps réel
- Filtres par tier (Gold/Silver/Bronze)
- Indicateurs de progression
- Podium top 3

### QR Codes
- Génération de QR codes pour check-in
- Rotation automatique (5 minutes)
- Téléchargement PNG
- Instructions d'utilisation

### Settings
- Configuration des règles de scoring
- Paramètres des ligues
- Anti-triche
- Règles personnalisables

## 🔌 API Integration

Le frontend communique avec le backend via l'API REST. Configuration dans `src/api/client.ts`.

**Endpoints principaux:**
- `/auth/*` - Authentification
- `/clubs/*` - Gestion clubs
- `/members/*` - Gestion membres
- `/seasons/*` - Gestion saisons
- `/leaderboard/*` - Classements
- `/health/*` - Check-ins et données santé

## 🎨 Customisation

### Couleurs (Tailwind)

Modifier `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eef2ff',
        // ... vos couleurs
      },
    },
  },
}
```

### Logo

Remplacer le logo dans:
- `public/logo.svg`
- Mettre à jour dans `src/components/layout/DashboardLayout.tsx`

## 🚢 Déploiement

### Docker

```bash
# Build l'image
docker build -t fitness-admin .

# Run le container
docker run -p 80:80 fitness-admin
```

### Netlify / Vercel

```bash
# Build
npm run build

# Le dossier dist/ contient les fichiers statiques
# Uploader sur Netlify/Vercel
```

### Nginx

Copier le dossier `dist/` vers `/var/www/html` et utiliser la configuration nginx fournie.

## 🔐 Authentification

L'authentification utilise JWT stocké dans localStorage.

**Flow:**
1. Login → JWT token reçu
2. Token stocké dans localStorage
3. Attaché à chaque requête API
4. Refresh automatique si expiré

## 📊 Mock Data

En développement, des données mockées sont utilisées. Pour utiliser l'API réelle:

1. Démarrer le backend sur port 3000
2. Configurer `VITE_API_URL` dans `.env`
3. Remplacer les mock data par les vrais appels API

## 🐛 Debug

### Mode développement

```bash
npm run dev
```

Vite hot-reload activé - les changements sont instantanés.

### Console logs

Tous les appels API sont loggés dans la console:
- Requêtes
- Réponses
- Erreurs

### React DevTools

Installer l'extension React DevTools pour Chrome/Firefox.

## 🧪 Tests (à venir)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## 📝 Conventions de code

- **Components**: PascalCase (ex: `DashboardPage.tsx`)
- **Files**: camelCase (ex: `authStore.ts`)
- **CSS**: Tailwind utility classes
- **Types**: Interfaces en PascalCase

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Propriétaire

## 🆘 Support

Pour toute question:
- Documentation technique: `/docs/TECHNICAL_DOCUMENTATION.md`
- Issues: GitHub Issues
- Email: support@yourplatform.com
