# ── Этап 1: Сборка ──
FROM node:20-alpine AS build
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходники
COPY . .

# Аргумент для API URL (передаётся при сборке)
ARG VITE_API_URL=http://localhost:8081/api
ENV VITE_API_URL=$VITE_API_URL

# Собираем продакшен-билд
RUN npm run build

# ── Этап 2: Раздача через Nginx ──
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем кастомный конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]