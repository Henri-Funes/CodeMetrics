# Feature Wallet / Merit Points

## Objetivo

`wallet` administra la billetera de Puntos de Merito. Existe para que cada suma o resta de puntos tenga historial y no sea solo un cambio directo en `Employee.pointBalance`.

## Flujo

1. `performance` calcula `pointsAwarded`.
2. `wallet` crea una transaccion `performance_bonus`.
3. `wallet` suma los puntos al `pointBalance` del empleado.
4. Si el empleado canjea un premio, `wallet` crea una transaccion negativa.
5. Si RRHH rechaza un canje, `wallet` crea una transaccion de reembolso.

## Modelo

`MeritTransaction` guarda:

- `employeeId`.
- `type`: `performance_bonus`, `redemption_debit`, `redemption_refund`, `admin_adjustment`.
- `points`: positivo para sumar, negativo para descontar.
- `balanceBefore` y `balanceAfter`.
- `reason`.
- `sourceType` y `sourceId`.
- `createdBy`.
- `metadata`.

## Endpoints

- `GET /api/wallet/transactions`: historial global para admin.
- `GET /api/wallet/employees/:employeeId`: saldo y resumen de un empleado.
- `GET /api/wallet/employees/:employeeId/transactions`: historial del empleado.
- `POST /api/wallet/adjustments`: ajuste manual de RRHH.
- `POST /api/wallet/performance-reviews/:reviewId/grant-bonus`: abona una review.
- `POST /api/wallet/performance-periods/:periodId/grant-bonuses`: abona todas las reviews de un periodo.

## Archivos

- `wallet.constants.js`: tipos de transaccion y origenes.
- `merit-transaction.model.js`: modelo Mongo/Mongoose del historial.
- `wallet.service.js`: reglas de saldo, abonos, debitos y ajustes.
- `wallet.controller.js`: adapta HTTP a servicios.
- `wallet.routes.js`: expone rutas `/api/wallet`.
