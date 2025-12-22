FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Supprimer dist/ pour forcer recompilation complète
RUN rm -rf dist/

# Build
RUN npm run build

RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/index.js"]
