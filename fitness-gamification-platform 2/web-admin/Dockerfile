# ===== Build Vite =====
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

ARG VITE_API_URL
ARG VITE_ENV
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENV=$VITE_ENV

COPY . .
RUN npm run build

# ===== Serve with Nginx =====
FROM nginx:alpine

# Copy compiled frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Replace nginx default config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
