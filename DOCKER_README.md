# Docker - CrossFood

## 🚀 Inicio Rápido

### 1. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Luego edita `.env` con tus valores.

### 2. Construir y ejecutar los contenedores

```bash
# Construir las imágenes
docker-compose build

# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 3. Acceder a los servicios

- **Frontend (Next.js)**: http://localhost:3000
- **Backend (FastAPI)**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

## 🛠️ Comandos Útiles

### Desarrollo

```bash
# Iniciar servicios
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Ver logs de un servicio específico
docker-compose logs -f app
docker-compose logs -f backend

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Reiniciar un servicio específico
docker-compose restart app
```

### Base de Datos

```bash
# Ejecutar migraciones
docker-compose exec backend uv run alembic upgrade head

# Crear nueva migración
docker-compose exec backend uv run alembic revision --autogenerate -m "descripcion"

# Acceder a PostgreSQL
docker-compose exec db psql -U postgres -d crossfood

# Hacer backup de la base de datos
docker-compose exec db pg_dump -U postgres crossfood > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U postgres crossfood < backup.sql
```

### Shell en los contenedores

```bash
# Shell en el contenedor de Next.js
docker-compose exec app sh

# Shell en el contenedor de backend
docker-compose exec backend sh

# Shell en el contenedor de base de datos
docker-compose exec db sh
```

## 📁 Estructura del Proyecto

```
CrossFood/
├── app/                    # Aplicación Next.js
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── backend/                # API FastAPI
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml      # Configuración de Docker Compose
├── .env                    # Variables de entorno (no versionado)
└── .env.example           # Ejemplo de variables de entorno
```

## 🔧 Desarrollo Local sin Docker

### Frontend (Next.js)

```bash
cd app
npm install
npm run dev
```

### Backend (FastAPI)

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

## 🐛 Troubleshooting

### Puerto ya en uso

Si recibes un error de puerto en uso:

```bash
# Cambiar el puerto en docker-compose.yml
# Por ejemplo, cambiar "3000:3000" a "3001:3000"
```

### Problemas con node_modules

```bash
# Limpiar y reconstruir
docker-compose down
docker-compose build --no-cache app
docker-compose up
```

### Base de datos corrupta

```bash
# Eliminar volúmenes y empezar de nuevo
docker-compose down -v
docker-compose up -d
```

### Ver uso de recursos

```bash
# Ver estadísticas de contenedores
docker stats

# Ver espacio usado por Docker
docker system df
```

## 📝 Notas

- Las imágenes usan `node:20-alpine` para el frontend (ligera y eficiente)
- El backend usa Python 3.13 con `uv` para manejo de dependencias
- PostgreSQL 16 para la base de datos
- Los datos de la base de datos persisten en un volumen Docker
- El modo `standalone` de Next.js está habilitado para producción optimizada

## 🔒 Seguridad

- Las imágenes ejecutan con usuarios no-root
- Las variables de entorno sensibles deben estar en `.env` (no versionado)
- En producción, usar secrets de Docker o variables de entorno del sistema
