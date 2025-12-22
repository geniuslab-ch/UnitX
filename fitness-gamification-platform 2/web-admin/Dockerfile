# ===== Build (Vite) =====
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ===== Run (Nginx) =====
FROM nginx:alpine

# Railway fournit PORT, on met un défaut
ENV PORT=8080

# Copier le build Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Copier un template nginx
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Exposer le port (Railway va router dessus)
EXPOSE 8080

# Générer la conf finale avec $PORT puis démarrer nginx
CMD ["/bin/sh", "-c", "envsubst '$$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
