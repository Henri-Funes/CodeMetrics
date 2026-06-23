# Feature Goals

## Objetivo

La feature `goals` cubre el Modulo de Planificacion y Objetivos del SGDLI. Permite simular que un Lider Tecnico o RRHH asigna metas claras a colaboradores durante un periodo de desempeno.

En esta iteracion el modulo se implementa en frontend con persistencia simulada en `localStorage`, porque el backend aun no expone `/api/goals`. Esto permite mostrar el flujo completo en demo sin romper el contrato actual de API.

## Conceptos

- `Goal`: objetivo asignado a un empleado.
- `employeeId`: colaborador responsable.
- `assignedBy`: admin/lider que asigna la meta.
- `periodId`: periodo de desempeno relacionado.
- `category`: tipo de objetivo, por ejemplo certificacion, deuda tecnica o entrega.
- `targetValue`: meta esperada.
- `currentValue`: avance actual.
- `progress`: porcentaje calculado de cumplimiento.
- `status`: estado visible del objetivo.

## Estados

- `not_started`: objetivo sin avance.
- `in_progress`: objetivo con avance parcial.
- `at_risk`: objetivo cerca de vencer con avance bajo.
- `completed`: objetivo cumplido.
- `cancelled`: objetivo retirado de la planificacion activa.

## Regla De Progreso

La regla vive en `frontend/src/features/goals/models/goals.model.js`.

- Si la unidad es `percent`, `currentValue` se interpreta como porcentaje.
- Si la unidad es `boolean`, `1` equivale a 100% y `0` a 0%.
- Para tareas, horas o items, el progreso es `currentValue / targetValue * 100`.
- El resultado se limita entre 0 y 100.
- Si el progreso llega a 100, el estado visible pasa a `completed`.
- Si faltan 7 dias o menos y el progreso es menor a 80%, el estado visible pasa a `at_risk`.

## Persistencia Simulada

Archivo:

- `frontend/src/shared/api/goals.api.js`

Responsabilidades:

- generar objetivos demo por empleado activo;
- listar objetivos;
- crear objetivos;
- editar objetivos;
- actualizar progreso;
- cancelar objetivos.

La informacion se guarda en `localStorage` bajo la llave `codemetrics.goals.v1`. Si el navegador no tiene `localStorage`, usa memoria temporal.

## Archivos Frontend

### `frontend/src/shared/api/goals.api.js`

Capa API simulada. Mantiene una interfaz parecida a las APIs reales del proyecto, pero sin llamar al backend.

Funciones:

- `ensureDemoGoals(employees, periods, assignedBy)`.
- `listGoals(params)`.
- `createGoal(payload)`.
- `updateGoal(goalId, payload)`.
- `updateGoalProgress(goalId, payload)`.
- `cancelGoal(goalId)`.

### `frontend/src/features/goals/models/goals.model.js`

Modelo de presentacion y reglas puras.

Funciones principales:

- `calculateGoalProgress(goal)`.
- `deriveGoalStatus(goal)`.
- `normalizeGoal(goal)`.
- `filterGoalsClient(goals, filters)`.
- `summarizeGoals(goals)`.
- `toGoalRows(goals, context)`.

### `frontend/src/features/goals/controllers/useEmployeeGoalsController.js`

Hook para la vista del empleado.

Responsabilidades:

- cargar periodos;
- asegurar objetivos demo del empleado activo;
- listar objetivos propios;
- actualizar progreso;
- exponer resumen.

### `frontend/src/features/goals/controllers/useAdminGoalsController.js`

Hook para la vista admin/lider.

Responsabilidades:

- cargar empleados activos y periodos;
- asegurar objetivos demo;
- filtrar objetivos;
- crear/editar objetivos;
- actualizar progreso;
- cancelar objetivos;
- exponer resumen global.

## Rutas UI

- `/goals`: vista del colaborador.
- `/admin/goals`: vista administrativa de planificacion.

## Nota De Integracion Futura

Cuando exista backend real, `goals.api.js` debe cambiarse para llamar a endpoints `/api/goals`, conservando la forma de datos usada por controllers y vistas. El resto del frontend deberia requerir pocos cambios si se mantiene el contrato.
