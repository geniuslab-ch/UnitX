FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache nginx

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_URL=https://unitx-production.up.railway.app/api/v1
ARG VITE_ENV=production
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENV=$VITE_ENV

RUN echo "Building with VITE_API_URL=$VITE_API_URL" && \
    npm run build && \
    ls -la dist/ && \
    find dist -type f && \
    mkdir -p /usr/share/nginx/html && \
    cp -rv dist/* /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/http.d/default.conf

RUN nginx -t

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
