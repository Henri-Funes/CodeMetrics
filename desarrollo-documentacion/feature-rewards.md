# Feature Rewards

## Objetivo

`rewards` administra el catalogo de premios que el empleado puede canjear con Puntos de Merito. Existe para separar la tienda del flujo de transacciones.

## Flujo

1. RRHH crea premios con costo y stock.
2. El empleado consulta el catalogo activo.
3. `redemptions` usa el premio elegido para crear un ticket de canje.
4. Cuando se solicita un canje, el stock se reserva.

## Modelo

`Reward` guarda:

- `name`.
- `description`.
- `category`: `licenses`, `training`, `hardware`, `time`, `wellness`.
- `costInPoints`.
- `stock`.
- `isActive`.

## Endpoints

- `GET /api/rewards`: lista premios para admin. Soporta `includeInactive`, `category`, `availableOnly`, `search`.
- `GET /api/rewards/catalog`: catalogo activo y disponible para empleado.
- `GET /api/rewards/:rewardId`: detalle de premio.
- `POST /api/rewards`: crea premio.
- `PATCH /api/rewards/:rewardId`: edita premio.
- `PATCH /api/rewards/:rewardId/activate`: activa premio.
- `PATCH /api/rewards/:rewardId/deactivate`: desactiva premio.

## Archivos

- `reward.constants.js`: categorias de premios.
- `reward.model.js`: modelo Mongo/Mongoose.
- `reward.service.js`: CRUD y filtros del catalogo.
- `reward.controller.js`: controladores HTTP.
- `reward.routes.js`: rutas `/api/rewards`.
