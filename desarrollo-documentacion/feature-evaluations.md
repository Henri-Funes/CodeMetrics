# Feature Evaluations

## Objetivo

La feature de evaluaciones extiende `performance` para cubrir el Modulo de Evaluacion de Desempeno del SGDLI.

El flujo ahora permite:

- autoevaluacion del colaborador;
- revision del supervisor;
- calculo automatico del KPI final;
- cierre de evaluacion;
- abono posterior de puntos solo cuando la evaluacion esta finalizada.

## Decision Tecnica

No se creo un modulo backend separado llamado `evaluations`. Se evoluciono `backend/src/features/performance/`, porque ahi ya existian:

- periodos de desempeno;
- reviews;
- calculo de KPI;
- resumen gerencial;
- relacion con wallet.

En frontend si existe `frontend/src/features/evaluations/` para separar pantallas y controllers del flujo de evaluacion.

## Estados De Review

- `draft`: evaluacion creada sin autoevaluacion.
- `self_submitted`: el colaborador envio autoevaluacion.
- `supervisor_reviewed`: el supervisor capturo KPIs y comentarios.
- `finalized`: score final cerrado y listo para incentivos.

## Backend

Archivos principales:

- `backend/src/features/performance/performance.constants.js`
- `backend/src/features/performance/performance-review.model.js`
- `backend/src/features/performance/performance.service.js`
- `backend/src/features/performance/performance.controller.js`
- `backend/src/features/performance/performance.routes.js`
- `backend/src/features/wallet/wallet.service.js`

Endpoints nuevos:

- `POST /api/performance/reviews/self-evaluations`
- `PATCH /api/performance/reviews/:reviewId/self-evaluation`
- `GET /api/performance/reviews/pending-supervisor`
- `PATCH /api/performance/reviews/:reviewId/supervisor-evaluation`
- `POST /api/performance/reviews/:reviewId/finalize`

Endpoints existentes conservados:

- periodos;
- listado de reviews;
- summary;
- create/update review tradicional;
- generacion demo de reviews.

## Reglas De Negocio

- La autoevaluacion no calcula puntos.
- El supervisor captura KPIs objetivos.
- El score final se calcula con las ponderaciones existentes de `performance.scoring.js`.
- Solo una review en estado `finalized` puede generar puntos de merito.
- `wallet` rechaza bonos de reviews incompletas.

## Seed

`backend/src/database/seed.js` genera reviews historicas finalizadas con:

- `selfEvaluation`;
- `supervisorEvaluation`;
- `finalScore`;
- `pointsAwarded`;
- `finalizedAt`.

Esto mantiene dashboards y billetera con datos completos despues de regenerar la base.

## Frontend

Archivos principales:

- `frontend/src/features/evaluations/models/evaluations.model.js`
- `frontend/src/features/evaluations/controllers/useEmployeeEvaluationController.js`
- `frontend/src/features/evaluations/controllers/useAdminEvaluationsController.js`
- `frontend/src/features/evaluations/views/EmployeeSelfEvaluation.jsx`
- `frontend/src/features/evaluations/views/AdminEvaluationsManager.jsx`

Rutas:

- `/evaluations`
- `/admin/evaluations`

## Integracion Con Dashboards

- `EmployeeDashboard` consulta reviews con `status=finalized`.
- `AdminDashboard` calcula resumen de performance con `status=finalized`.
- La gestion de pendientes vive en `/admin/evaluations`.
