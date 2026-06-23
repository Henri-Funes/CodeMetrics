# Goals UI (Modulo de Planificacion y Objetivos)

Este modulo agrega las pantallas necesarias para cubrir la planificacion de metas del SGDLI. Sigue el mismo estilo visual del resto del frontend: React, Ant Design, `Card`, `Table`, `Progress`, `Statistic`, `Modal` y hooks por controller.

## Rutas

- `/goals`: vista del empleado.
- `/admin/goals`: vista de RRHH/Lider Tecnico.

## Menu

Empleado:

- Se agrega `Objetivos` al menu superior junto a `Mi Desempeño`, `Tienda` y `Billetera`.

Admin:

- Se agrega `Planificacion` al menu lateral junto a `Resumen`, `Gestion de Tienda`, `Canjes Pendientes` y `Billetera`.

## 1. `EmployeeGoals`

Uso:

- El colaborador consulta sus objetivos asignados.
- Puede actualizar su avance de forma simulada.
- El estado cambia visualmente segun progreso y fecha limite.

Componentes:

- `Statistic`: resumen de objetivos activos, completados, en riesgo y progreso promedio.
- `Card`: cada objetivo se muestra como tarjeta individual.
- `Progress`: barra dinamica de cumplimiento.
- `Tag`: categoria, periodo, peso y estado.
- `Modal` + `Form`: actualizacion de avance y nota de evidencia.

Estados UX:

- `loading`: `Skeleton`.
- `error`: `Alert` con boton de reintento.
- `success`: `Alert` despues de guardar avance.
- `empty`: `Empty` si no hay objetivos asignados.

## 2. `AdminGoalsManager`

Uso:

- RRHH o Lider Tecnico asigna, edita, filtra, actualiza o cancela objetivos.

Componentes:

- `Statistic`: resumen global de objetivos.
- `Table`: listado administrativo de objetivos.
- `Select`: filtros por empleado, periodo, estado y categoria.
- `Input.Search`: busqueda por texto.
- `Progress`: avance por objetivo dentro de la tabla.
- `Modal` + `Form`: crear o editar objetivo.
- `Popconfirm`: confirmacion al cancelar objetivo.

Campos del formulario:

- empleado;
- periodo;
- titulo;
- descripcion;
- categoria;
- unidad;
- meta;
- avance actual;
- peso;
- fecha limite;
- estado inicial.

## Colores De Estado

- `not_started`: default.
- `in_progress`: processing.
- `at_risk`: warning.
- `completed`: success.
- `cancelled`: error.

## Alcance Actual

El modulo es simulado en frontend y persiste en `localStorage`. Esto permite presentar la rubrica sin depender todavia de un backend `goals`.

Cuando se implemente backend real, la UI deberia mantenerse igual y solo cambiar la capa `frontend/src/shared/api/goals.api.js`.
