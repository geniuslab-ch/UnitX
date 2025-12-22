# Étape 1 : Construction de l'application
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# On s'assure que les variables d'env sont présentes au build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Étape 2 : Serveur web Nginx pour servir les fichiers statiques
FROM nginx:alpine

# Copie des fichiers buildés depuis l'étape précédente
COPY --from=build /app/dist /usr/share/nginx/html

# IMPORTANT : On écrase la config Nginx par défaut pour gérer le SPA Routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
