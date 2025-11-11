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

# Construir aplicación Angular para producción con rutas para /cotizaciones/
RUN npm run build -- --configuration production --base-href /cotizaciones/

# ================================
# Stage 2: Production
# ================================
FROM nginx:alpine

# Copiar archivos del build al subdirectorio /cotizaciones/
COPY --from=build /app/dist/front-plantilla/browser /usr/share/nginx/html/cotizaciones

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]

