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
RUN npm run build -- --configuration production

# ================================
# Stage 2: Production
# ================================
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar serve globalmente
RUN npm install -g serve

# Copiar archivos compilados desde stage de build
COPY --from=build /app/dist/front-plantilla/browser ./dist

# Exponer puerto 3001
EXPOSE 3001

# Comando para iniciar el servidor
# serve sirve los archivos estáticos y maneja el routing de SPA
CMD ["serve", "-s", "dist", "-l", "3001"]

