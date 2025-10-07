# ~/programas/react/amade/web/Dockerfile
# syntax=docker/dockerfile:1

########################
# Base (instala deps)
########################
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

########################
# Desarrollo (Vite)
########################
FROM base AS dev
ENV NODE_ENV=development
EXPOSE 5173
# Vite necesita --host 0.0.0.0 para aceptar conexiones externas (Docker)
CMD ["npm","run","dev","--","--host","0.0.0.0"]

########################
# Build de producción
########################
FROM base AS build
ENV NODE_ENV=production
RUN npm run build

########################
# Producción (Nginx)
########################
FROM nginx:1.27-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copia el build estático
COPY --from=build /app/dist /usr/share/nginx/html
# (En el siguiente paso te doy un nginx.conf con fallback SPA)
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
