# =====================================================
# STAGE 1: Build - Construir la aplicación Angular
# =====================================================
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar el resto de los archivos del proyecto
COPY . .

# Construir la aplicación para producción
RUN npm run build -- --configuration production

# =====================================================
# STAGE 2: Production - Servir con nginx
# =====================================================
FROM nginx:alpine

# Copiar los archivos construidos desde la etapa de build
COPY --from=build /app/dist/front-plantilla/browser /usr/share/nginx/html

# Copiar configuración personalizada de nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 8080
EXPOSE 8080

# Comando por defecto de nginx (ya está en la imagen base)
CMD ["nginx", "-g", "daemon off;"]

