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
# ... (partie build identique)

FROM nginx:alpine
# On supprime la config par défaut
RUN rm /etc/nginx/conf.d/default.conf
# On copie notre config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# On copie les fichiers statiques
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
