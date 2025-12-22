FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production || npm install --production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

**Commit sur GitHub**

---

## Vérifiez les Variables MAINTENANT

**Pendant que ça rebuild, vérifiez:**

**Railway → Backend → Variables**

**Vous DEVEZ avoir:**
```
DATABASE_URL = ${{Postgres.DATABASE_URL}}  🔗 (référence)
JWT_SECRET = ...
CORS_ORIGIN = https://distinguished-compassion-production.up.railway.app
NODE_ENV = production
PORT = 3000
```

**Si DATABASE_URL n'est PAS une référence 🔗, RECRÉEZ-LA !**

---

## Après le Rebuild

**Logs devront montrer:**
```
✅ npm install
✅ npm run build
✅ TypeScript compiled
✅ Server listening on port 3000
✅ Database connected
```

**Pas de:**
```
❌ nginx
❌ ECONNREFUSED 127.0.0.1:5432
