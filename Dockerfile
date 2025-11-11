# ================================
# Stage 1: Build
# ================================
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Construir aplicación Angular para producción
# Usa el baseHref del angular.json (/cotizaciones/)
RUN npm run build -- --configuration production

# ================================
# Stage 2: Production
# ================================
FROM nginx:alpine

# Copiar archivos compilados desde stage de build
COPY --from=build /app/dist/front-plantilla/browser /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]

