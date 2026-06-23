# Evaluations UI (Modulo de Evaluacion de Desempeno)

Este modulo agrega las pantallas del flujo formal de evaluacion de desempeno.

## Rutas

- `/evaluations`: autoevaluacion del colaborador.
- `/admin/evaluations`: bandeja de revision del supervisor.

## Menu

Empleado:

- Se agrega `Evaluaciones` junto a `Mi Desempeño`, `Objetivos`, `Tienda` y `Billetera`.

Admin:

- Se agrega `Evaluaciones` junto a `Resumen`, `Planificacion`, `Gestion de Tienda`, `Canjes Pendientes` y `Billetera`.

## 1. `EmployeeSelfEvaluation`

Uso:

- El colaborador selecciona periodo.
- Captura logros tecnicos, bloqueos, colaboracion y aprendizajes.
- Registra un auto puntaje de 0 a 100.
- Envia o actualiza su autoevaluacion si aun no fue revisada.
- Consulta el resultado final cuando la evaluacion esta finalizada.

Componentes:

- `Select`: periodo.
- `Tag`: estado de evaluacion.
- `Form`: campos de autoevaluacion.
- `Input.TextArea`: justificaciones.
- `InputNumber`: auto puntaje.
- `Progress` y `Statistic`: resultado final.

## 2. `AdminEvaluationsManager`

Uso:

- RRHH o Lider Tecnico revisa autoevaluaciones.
- Captura KPIs del supervisor.
- Visualiza preview automatico de score.
- Finaliza evaluaciones revisadas.

Componentes:

- `Statistic`: total, pendientes, revisadas y finalizadas.
- `Table`: bandeja de evaluaciones.
- `Select`: filtros por estado, periodo y empleado.
- `Drawer`: detalle de autoevaluacion y formulario del supervisor.
- `InputNumber`: KPIs de calidad, entrega, bugs, colaboracion e innovacion.
- `Progress`: score estimado.
- `Popconfirm`: confirmacion para finalizar.

## Estados

- `draft`: Borrador.
- `self_submitted`: Autoevaluada.
- `supervisor_reviewed`: Revisada.
- `finalized`: Finalizada.

## Alcance

El flujo queda conectado al backend real `performance`. A diferencia de `goals`, este modulo no es localStorage: usa los endpoints nuevos bajo `/api/performance/reviews`.
