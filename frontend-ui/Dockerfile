# Stage 1 - Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2 - Serve with nginx + TLS
FROM nginx:1.25-alpine

# Set workdir
WORKDIR /etc/nginx

# Copy nginx config and TLS certs
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY certs/fullchain.pem /etc/ssl/certs/fullchain.pem
COPY certs/privkey.pem /etc/ssl/private/privkey.pem

# Copy static site content
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 443/tcp

CMD ["nginx", "-g", "daemon off;"]
