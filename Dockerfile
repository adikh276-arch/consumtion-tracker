# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Set build-time variables
ARG VITE_NEON_DATABASE_URL
ENV VITE_NEON_DATABASE_URL=$VITE_NEON_DATABASE_URL
ENV VITE_APP_TITLE="Smoke Check"

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Create the target directory for subpath hosting
RUN mkdir -p /usr/share/nginx/html/consumption_tracker

# Copy the build output to the subpath directory
COPY --from=builder /app/dist /usr/share/nginx/html/consumption_tracker

# Copy custom nginx configuration
# Assuming the default nginx config loads files from /etc/nginx/conf.d/
COPY vite-nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
