FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# On compile si c'est du TypeScript
RUN npm run build 

# Le backend doit écouter sur un port (souvent 3000)
EXPOSE 3000
CMD ["node", "dist/index.js"]
