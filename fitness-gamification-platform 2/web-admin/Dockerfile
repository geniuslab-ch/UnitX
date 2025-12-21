# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build with verification
RUN npm run build && \
    ls -la dist/ && \
    echo "Build files created:" && \
    find dist -type f | head -20

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Verify copied files
RUN ls -la /usr/share/nginx/html && \
    echo "Nginx serving from /usr/share/nginx/html"

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN nginx -t

EXPOSE
