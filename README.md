# CodeMetrics

**Sistema de Gestión del Desempeño e Incentivos Laborales (SGDLI)** — plataforma web académica que simula cómo una empresa de tecnología mide el rendimiento de sus equipos IT y lo convierte en incentivos reales.

> ¿Cómo reconocemos y premiamos el buen trabajo de desarrolladores y personal técnico de forma medible, trazable y motivadora?

CodeMetrics cierra el ciclo completo: **evaluar → puntuar → acumular → canjear → supervisar**. Los empleados consultan su desempeño y gastan Puntos de Mérito en una tienda interna; RRHH y liderazgo técnico administran recompensas, canjes y métricas globales desde un panel dedicado.

---

## Qué hace la app

| Rol | Rutas principales | Capacidades |
|-----|-------------------|-------------|
| **Empleado** | `/dashboard`, `/wallet`, `/store` | Ver evaluación y KPIs, historial de puntos, catálogo y canje de recompensas |
| **Administrador** | `/admin`, `/admin/rewards`, `/admin/redemptions`, `/admin/wallet` | Gestionar catálogo, aprobar canjes, ajustar billeteras y consultar métricas operativas |

La demo usa un **selector de usuario simulado** (sin login real) para alternar entre perfiles empleado y administrador.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 19, Vite 7, Ant Design 6 |
| **Backend** | Node.js 24 LTS, Express 5, Mongoose 9 |
| **Base de datos** | MongoDB 8.2 (local con Docker) / Atlas en producción |
| **Datos de prueba** | Faker.js — seed manual (`npm run seed` en backend) |
| **Despliegue** | Monorepo, imagen Docker única para Heroku |

**Arquitectura:** monorepo con frontend MVC ligero por feature y backend en vertical slices bajo `backend/src/features/`. En producción, Express sirve `/api/*` y el build estático de React desde `backend/public`.

---

## Arranque rápido (Docker)

```bash
docker compose up --build
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |
| MongoDB | localhost:27017 |

Poblar datos de ejemplo (desde el contenedor o directorio `backend/`):

```bash
npm run seed
```

---

## Documentación del proyecto

| Carpeta | Contenido |
|---------|-----------|
| [`desarrollo-documentacion/`](./desarrollo-documentacion/) | Features backend: empleados, desempeño, billetera, recompensas, canjes |
| [`desarrollo-documentacion-UI/`](./desarrollo-documentacion-UI/) | Vistas y flujos de la interfaz por pantalla |
| [`desarrollo-documentacion-funcional/`](./desarrollo-documentacion-funcional/) | Lenguaje de negocio: propósito, demo, glosario y ciclo de datos |

Para una introducción orientada al negocio, empieza por [`desarrollo-documentacion-funcional/README.md`](./desarrollo-documentacion-funcional/README.md).

---

## Contexto académico

Módulo del curso de **Sistemas de Información Gerencial**. El MVP prioriza el núcleo del ciclo incentivo (evaluación, puntos, billetera, tienda y panel admin) como base demostrable para defensa y evolución futura del SGDLI.
