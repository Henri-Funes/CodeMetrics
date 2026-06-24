# Requeriments — CodeMetrics

Guía para levantar el proyecto en una **máquina nueva** desde cero.

---

## 1. Software requerido

| Herramienta | Versión mínima | Para qué |
|-------------|----------------|----------|
| **Node.js** | 24 LTS | Backend, build del frontend y scripts de la raíz |
| **npm** | 10+ (incluido con Node) | Instalar dependencias y ejecutar scripts |
| **Git** | Cualquier versión reciente | Clonar el repositorio |
| **Docker Desktop** | Reciente (opcional) | Desarrollo con `docker compose` (frontend + backend en caliente) |
| **Cuenta MongoDB Atlas** | — | Base de datos en la nube (`codemetrics`) |

### Verificar instalación

```bash
node -v    # debe mostrar v24.x
npm -v
git --version
docker --version   # opcional
```

---

## 2. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd CodeMetrics
```

---

## 3. Variables de entorno

1. Copiar la plantilla:

```bash
cp .env.example .env
```

2. Editar `.env` y configurar al menos:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/codemetrics?retryWrites=true&w=majority&appName=Cluster0
```

### MongoDB Atlas (obligatorio)

En el panel de Atlas:

1. **Database Access** — usuario con permisos de lectura/escritura.
2. **Network Access** — permitir tu IP o `0.0.0.0/0` (necesario para Heroku).
3. La URI debe incluir el nombre de base de datos: `/codemetrics`.

> El archivo `.env` **no se sube a git**. Cada desarrollador y Heroku deben tener su propia copia.

### Variables en Heroku (producción)

Configurar en **Settings → Config Vars**:

| Variable | Valor |
|----------|-------|
| `MONGODB_URI` | URI completa de Atlas |
| `NODE_ENV` | `production` |
| `PORT` | Lo asigna Heroku automáticamente |

---

## 4. Instalar dependencias

Desde la **raíz** del proyecto:

```bash
npm run install:all
```

Equivale a:

```bash
npm ci --prefix frontend
npm ci --prefix backend
```

---

## 5. Cargar datos de demostración (seed)

Solo la primera vez o cuando quieras resetear la demo:

```bash
npm run seed
```

Crea empleados, evaluaciones, recompensas, canjes, etc. en Atlas.

---

## 6. Modos de ejecución

### A) Desarrollo con Docker (recomendado para demo local)

Requiere `.env` en la raíz con `MONGODB_URI`.

```bash
docker compose up --build
```

| Servicio | URL |
|----------|-----|
| Frontend (Vite, hot reload) | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |

El frontend en desarrollo llama al backend en `http://localhost:3000` (variable `VITE_API_URL` en `docker-compose.yml`).

Seed dentro del contenedor:

```bash
docker compose exec backend npm run seed
```

### B) Desarrollo sin Docker

Terminal 1 — backend:

```bash
cd backend
npm run dev
```

Terminal 2 — frontend:

```bash
cd frontend
npm run dev
```

Abrir http://localhost:5173

### C) Producción local (mismo modo que Heroku)

Un solo proceso: Express sirve API + React compilado.

```bash
npm run build
npm run start:prod
```

Abrir http://localhost:3000

| Ruta | Contenido |
|------|-----------|
| `/` | App React (SPA) |
| `/api/*` | API REST |
| `/api/health` | Estado del servidor y MongoDB |

El build copia `frontend/dist` → `backend/public/`.

---

## 7. Build para Heroku

El despliegue usa **contenedor Docker** (`heroku.yml` + `Dockerfile` en la raíz).

Flujo del build:

1. Compila el frontend con Vite (`frontend/dist`).
2. Copia el resultado a `backend/public/`.
3. El backend Express sirve estáticos + API en producción.

Comandos locales para validar antes de desplegar:

```bash
npm run install:all
npm run build
docker build -t codemetrics .
docker run --env-file .env -e NODE_ENV=production -p 3000:3000 codemetrics
```

En Heroku:

1. Crear app con stack de contenedores.
2. Conectar el repositorio.
3. Configurar `MONGODB_URI` y `NODE_ENV=production` en Config Vars.
4. Desplegar (push a Heroku o integración con GitHub).
5. Ejecutar seed una vez si la BD está vacía: `heroku run npm run seed`

---

## 8. Scripts disponibles (raíz)

| Script | Descripción |
|--------|-------------|
| `npm run install:all` | Instala dependencias de frontend y backend |
| `npm run build` | Build frontend + copia a `backend/public` |
| `npm run build:frontend` | Solo build de Vite |
| `npm run start` | Arranca backend en modo desarrollo |
| `npm run start:prod` | Arranca backend en producción (sirve SPA) |
| `npm run seed` | Pobla MongoDB Atlas con datos demo |
| `npm run dev:docker` | Atajo a `docker compose up --build` |

---

## 9. Estructura del artefacto de producción

No hay un único folder `dist/` en la raíz. El empaquetado es:

```
backend/
  src/           # Código del API (Express + Mongoose)
  public/        # Frontend compilado (generado por npm run build)
  node_modules/
  package.json
```

En Docker/Heroku, el `Dockerfile` reproduce este layout automáticamente.

---

## 10. Comprobaciones rápidas

```bash
# API y base de datos
curl http://localhost:3000/api/health

# Resumen de empleados (requiere seed previo)
curl http://localhost:3000/api/employees/summary
```

Respuesta esperada de health:

```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 11. Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| `Missing required environment variable: MONGODB_URI` | Crear `.env` desde `.env.example` |
| `MongoServerSelectionError` | Revisar Network Access en Atlas y la URI |
| Frontend sin datos en producción | Verificar que corriste `npm run build` antes de `start:prod` |
| Puerto en uso | Cambiar `PORT` en `.env` o detener el proceso en 3000 |
| Seed vacío o error | Confirmar `MONGODB_URI` y permisos del usuario en Atlas |

---

## 12. Documentación adicional

| Archivo / carpeta | Contenido |
|-------------------|-----------|
| [`README.md`](./README.md) | Visión general del proyecto |
| [`desarrollo-documentacion-funcional/`](./desarrollo-documentacion-funcional/) | Uso de la demo y flujos de negocio |
| [`desarrollo-documentacion/`](./desarrollo-documentacion/) | Features del backend |
| [`desarrollo-documentacion-UI/`](./desarrollo-documentacion-UI/) | Pantallas del frontend |
