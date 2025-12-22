# Build stage
FROM node:20-alpine AS builder

# Cache buster - change this to force rebuild
RUN echo "Cache bust v3 - $(date)"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Pass build arguments
ARG VITE_API_URL
ARG VITE_ENV
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENV=$VITE_ENV

# Build application with verification
RUN npm run build && \
    ls -la dist/ && \
    echo "Build files:" && \
    find dist -type f | head -20

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify files were copied
RUN ls -la /usr/share/nginx/html && \
    echo "Nginx will serve from /usr/share/nginx/html"

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Test nginx config
RUN nginx -t

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
