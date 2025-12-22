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
