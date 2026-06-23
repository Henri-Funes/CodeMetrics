# Feature Redemptions

## Objetivo

`redemptions` administra los tickets de canje. Existe para conectar empleado, premio, wallet y aprobacion de RRHH.

## Flujo

1. Empleado solicita canje de un `Reward`.
2. El sistema verifica premio activo, stock y saldo suficiente.
3. Se reserva stock.
4. `wallet` descuenta puntos con `redemption_debit`.
5. Se crea ticket `pending`.
6. RRHH aprueba, rechaza o marca entregado.
7. Si RRHH rechaza, `wallet` reembolsa puntos y se repone stock.

## Modelo

`Redemption` guarda:

- `employeeId`.
- `rewardId`.
- `rewardSnapshot`: nombre, categoria y costo al momento del canje.
- `pointsSpent`.
- `status`: `pending`, `approved`, `rejected`, `delivered`.
- `requestedAt`, `resolvedAt`, `deliveredAt`.
- `reviewedBy`.
- `requestNote`.
- `decisionReason`.

## Endpoints

- `GET /api/redemptions`: bandeja global para admin.
- `GET /api/redemptions/summary`: resumen por estado.
- `GET /api/redemptions/employees/:employeeId`: canjes de un empleado.
- `GET /api/redemptions/:redemptionId`: detalle de ticket.
- `POST /api/redemptions`: empleado solicita canje.
- `PATCH /api/redemptions/:redemptionId/approve`: RRHH aprueba.
- `PATCH /api/redemptions/:redemptionId/reject`: RRHH rechaza y reembolsa.
- `PATCH /api/redemptions/:redemptionId/deliver`: RRHH marca entregado.

## Archivos

- `redemption.constants.js`: estados del canje.
- `redemption.model.js`: modelo Mongo/Mongoose.
- `redemption.service.js`: flujo seguro de canje, aprobacion y reembolso.
- `redemption.controller.js`: controladores HTTP.
- `redemption.routes.js`: rutas `/api/redemptions`.
