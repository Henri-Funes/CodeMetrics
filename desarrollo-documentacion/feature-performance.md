# Feature Performance

## Objetivo

La feature `performance` calcula y conserva el desempeno mensual de los empleados informaticos del SGDLI. Su trabajo es convertir KPIs estandarizados en una nota final y en puntos calculados para que luego el modulo `wallet` pueda abonarlos con historial.

Esta feature existe porque el sistema necesita justificar de donde salen los Puntos de Merito. No basta con aumentar un saldo: primero debe existir una evaluacion mensual trazable.

## Conceptos

- `PerformancePeriod`: periodo mensual evaluado, por ejemplo `2026-05`.
- `PerformanceReview`: evaluacion de un empleado en un periodo.
- `KPIs`: metricas numericas de 0 a 100.
- `finalScore`: nota final ponderada de 0 a 100.
- `pointsAwarded`: puntos calculados a partir de la nota final.

## KPIs

Los KPIs iniciales son:

- `qualityScore`: calidad del trabajo entregado.
- `deliveryScore`: cumplimiento de entregas.
- `bugFixRate`: efectividad corrigiendo errores.
- `collaborationScore`: colaboracion con el equipo.
- `innovationScore`: aportes tecnicos o mejoras propuestas.

## Regla De Calculo

La nota final usa ponderaciones:

- Calidad: 30%.
- Entrega: 25%.
- Correccion de bugs: 20%.
- Colaboracion: 15%.
- Innovacion: 10%.

Luego la nota se convierte en puntos:

- `95-100`: 1000 puntos.
- `90-94.99`: 800 puntos.
- `80-89.99`: 600 puntos.
- `70-79.99`: 350 puntos.
- `60-69.99`: 150 puntos.
- `<60`: 0 puntos.

Estos puntos son calculados, pero aun no son una transaccion real de billetera.

## Flujo Principal

1. RRHH o el sistema crea un `PerformancePeriod` mensual.
2. Se registra una `PerformanceReview` por empleado activo.
3. El backend normaliza KPIs para mantenerlos entre 0 y 100.
4. El backend calcula `finalScore`.
5. El backend calcula `pointsAwarded`.
6. El dashboard puede consultar resumen y top performers.
7. Mas adelante, `wallet` tomara estas evaluaciones y creara transacciones de abono.

## Endpoints

- `GET /api/performance/periods`: lista periodos.
- `POST /api/performance/periods`: crea un periodo.
- `GET /api/performance/periods/:periodId`: obtiene un periodo.
- `PATCH /api/performance/periods/:periodId/status`: cambia estado del periodo.
- `POST /api/performance/periods/:periodId/reviews/generate`: genera reviews demo para empleados activos sin review.
- `GET /api/performance/reviews`: lista reviews. Soporta `employeeId` y `periodId`.
- `GET /api/performance/reviews/summary`: resumen gerencial. Soporta `employeeId` y `periodId`.
- `GET /api/performance/reviews/:reviewId`: obtiene una review.
- `POST /api/performance/reviews`: crea una review.
- `PATCH /api/performance/reviews/:reviewId`: recalcula una review.

## Archivos

### `backend/src/features/performance/performance.constants.js`

Esta ahi para centralizar estados, campos KPI y pesos. Evita repetir strings como `qualityScore` o `closed` en varios archivos.

Define:

- `PERFORMANCE_PERIOD_STATUS`: estados de periodo.
- `KPI_FIELDS`: KPIs soportados.
- `KPI_WEIGHTS`: ponderaciones de calculo.

### `backend/src/features/performance/performance.scoring.js`

Esta ahi porque la logica de puntaje debe ser pura y reutilizable. El servicio y el seed la usan sin depender de HTTP o MongoDB.

Funciones:

- `normalizeKpis(kpis)`: convierte KPIs a numeros validos entre 0 y 100.
- `calculateFinalScore(kpis)`: calcula la nota ponderada.
- `calculatePointsAwarded(finalScore)`: convierte nota en puntos.
- `calculatePerformanceResult(kpis)`: devuelve KPIs normalizados, nota y puntos juntos.

### `backend/src/features/performance/performance-period.model.js`

Esta ahi para guardar el mes evaluado. Permite agrupar reviews por periodo y comparar desempeno historico.

Campos:

- `month`.
- `year`.
- `label`.
- `status`.
- `calculatedAt`.
- `closedAt`.

### `backend/src/features/performance/performance-review.model.js`

Esta ahi para guardar la evaluacion de un empleado en un mes especifico.

Campos:

- `employeeId`.
- `periodId`.
- `kpis`.
- `finalScore`.
- `pointsAwarded`.
- `notes`.

Tiene un indice unico `employeeId + periodId` para evitar dos evaluaciones del mismo empleado en el mismo mes.

### `backend/src/features/performance/performance.service.js`

Esta ahi porque contiene la logica de negocio real. Los controladores no calculan ni consultan directamente modelos.

Funciones:

- `listPerformancePeriods()`: lista periodos.
- `createPerformancePeriod(payload)`: crea periodo mensual.
- `getPerformancePeriodById(periodId)`: obtiene periodo por id.
- `updatePerformancePeriodStatus(periodId, status)`: cambia estado.
- `listPerformanceReviews(query)`: lista evaluaciones con filtros.
- `getPerformanceReviewById(reviewId)`: obtiene una evaluacion.
- `createPerformanceReview(payload)`: crea evaluacion y calcula nota/puntos.
- `updatePerformanceReview(reviewId, payload)`: actualiza KPIs y recalcula.
- `generatePeriodReviews(periodId)`: crea evaluaciones demo para empleados activos.
- `getPerformanceSummary(query)`: calcula resumen y top performers.

### `backend/src/features/performance/performance.controller.js`

Esta ahi para adaptar las peticiones HTTP al servicio. Su responsabilidad es recibir `req`, llamar funciones del servicio y devolver JSON.

### `backend/src/features/performance/performance.routes.js`

Esta ahi para declarar las rutas de la feature y mantener el router principal limpio.

### `backend/src/routes/api.routes.js`

Registra `performanceRoutes` bajo `/api/performance`.

### `backend/src/database/seed.js`

Ahora tambien crea datos falsos de performance:

- 6 periodos mensuales.
- Evaluaciones para empleados activos.
- KPIs, notas y puntos calculados.

Esto existe para que el dashboard tenga informacion realista sin conectarse a ERP ni sistemas externos.

## Relacion Con Wallet

`performance` calcula `pointsAwarded`, pero no deberia mover el saldo final directamente. El modulo `wallet` se encargara de convertir esos puntos calculados en transacciones auditables.

Ejemplo futuro:

1. Performance calcula `pointsAwarded = 800`.
2. Wallet crea una transaccion `performance_bonus`.
3. Wallet suma 800 al `pointBalance` del empleado.
4. El historial muestra por que se sumaron esos puntos.
