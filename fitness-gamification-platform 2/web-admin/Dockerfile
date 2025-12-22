FROM node:20-alpine

WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Set environment variables for build
ARG VITE_API_URL=https://unitx-production.up.railway.app/api/v1
ARG VITE_ENV=production
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENV=$VITE_ENV

# Build with verbose output
RUN echo "Building with VITE_API_URL=$VITE_API_URL" && \
    npm run build && \
    echo "=== Build completed ===" && \
    ls -la dist/ && \
    echo "=== Files in dist ===" && \
    find dist -type f && \
    echo "=== Copying to nginx ===" && \
    mkdir -p /usr/share/nginx/html && \
    cp -rv dist/* /usr/share/nginx/html/ && \
    echo "=== Files in nginx html ===" && \
    ls -la /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Test nginx
RUN nginx -t

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Commit**

---

## Ce Que Ça Change

1. ✅ **Pas de multi-stage** = pas de cache entre stages
2. ✅ **Variables hardcodées** dans le Dockerfile
3. ✅ **Verbose output** = on verra EXACTEMENT ce qui se passe
4. ✅ **Copy manuel** vers nginx = on voit si les fichiers existent

---

## Après le Rebuild - Logs à Vérifier

**Vous DEVEZ voir:**
```
Building with VITE_API_URL=https://unitx-production.up.railway.app/api/v1
=== Build completed ===
dist/index.html
dist/assets/
=== Files in dist ===
dist/index.html
dist/assets/index-XXX.js      ← DOIT apparaître !
dist/assets/index-YYY.css     ← DOIT apparaître !
=== Copying to nginx ===
=== Files in nginx html ===
index.html
assets/index-XXX.js
assets/index-YYY.css
