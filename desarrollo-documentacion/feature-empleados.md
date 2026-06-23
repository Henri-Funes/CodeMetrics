# Feature Empleados

## Objetivo

La feature `employees` representa a las personas que usaran el SGDLI: empleados informaticos y administradores de RRHH o liderazgo tecnico. Es la base para conectar luego desempeno, billetera de puntos, canjes y dashboard gerencial.

## Roles

- `employee`: perfil empleado o desarrollador. Consulta sus KPIs, puntos, tienda y canjes.
- `admin`: perfil administrador. Gestiona catalogo, canjes, ajustes y metricas globales.

## Modelo De Datos

El modelo `Employee` guarda los campos base del usuario del sistema:

- `name`: nombre completo.
- `email`: correo unico normalizado en minusculas.
- `role`: `employee` o `admin`.
- `department`: area organizacional.
- `position`: cargo.
- `pointBalance`: saldo actual de Puntos de Merito.
- `isActive`: indica si el perfil puede operar en el sistema.
- `createdAt` y `updatedAt`: timestamps automaticos de Mongoose.

Nota de diseno: `pointBalance` se guarda en empleados para consultar el saldo rapidamente, pero los cambios de puntos no deberian hacerse directamente desde empleados. El historial y auditoria se implementaran en el modulo de billetera/transacciones.

## Flujo Principal

1. El backend conecta a MongoDB al iniciar.
2. Las rutas `/api/employees` quedan registradas en el router principal.
3. El administrador puede listar, crear, editar, activar o desactivar empleados.
4. El sistema puede consultar un empleado por id.
5. El dashboard puede pedir `/api/employees/summary` para obtener conteos generales.
6. El seed local genera empleados falsos para poblar la app demostrativa.

## Endpoints

- `GET /api/employees`: lista empleados. Soporta filtros `role`, `isActive` y `search`.
- `GET /api/employees/summary`: devuelve resumen de empleados, admins, activos e inactivos.
- `GET /api/employees/:employeeId`: obtiene un empleado por id.
- `POST /api/employees`: crea un empleado.
- `PATCH /api/employees/:employeeId`: edita campos basicos del empleado.
- `PATCH /api/employees/:employeeId/activate`: activa el perfil.
- `PATCH /api/employees/:employeeId/deactivate`: desactiva el perfil.

## Archivos

### `backend/src/features/employees/employee.constants.js`

Define constantes compartidas:

- `EMPLOYEE_ROLES`: roles soportados.
- `EMPLOYEE_ROLE_VALUES`: arreglo de roles validos para Mongoose.
- `DEFAULT_EMPLOYEE_POINT_BALANCE`: saldo inicial por defecto.

### `backend/src/features/employees/employee.model.js`

Define el esquema Mongoose `Employee`.

Responsabilidades:

- Validar campos obligatorios.
- Forzar email unico y en minusculas.
- Restringir `role` a valores validos.
- Inicializar `pointBalance` en `0`.
- Agregar indices para filtros y busqueda textual.

### `backend/src/features/employees/employee.service.js`

Contiene la logica de negocio y acceso a datos.

Funciones:

- `listEmployees(query)`: lista empleados usando filtros de rol, estado y busqueda.
- `getEmployeeById(employeeId)`: obtiene un empleado por id y valida ObjectId.
- `createEmployee(payload)`: crea un empleado y maneja conflicto de email duplicado.
- `updateEmployee(employeeId, payload)`: edita solo campos permitidos.
- `setEmployeeActiveStatus(employeeId, isActive)`: activa o desactiva un empleado.
- `getEmployeeSummary()`: calcula totales para dashboard.

### `backend/src/features/employees/employee.controller.js`

Adapta HTTP hacia los servicios.

Funciones:

- `listEmployeesHandler(req, res, next)`: responde la lista de empleados.
- `getEmployeeHandler(req, res, next)`: responde un empleado especifico.
- `createEmployeeHandler(req, res, next)`: crea y responde con estado `201`.
- `updateEmployeeHandler(req, res, next)`: actualiza un empleado.
- `activateEmployeeHandler(req, res, next)`: marca `isActive` en `true`.
- `deactivateEmployeeHandler(req, res, next)`: marca `isActive` en `false`.
- `getEmployeeSummaryHandler(req, res, next)`: responde el resumen de empleados.

### `backend/src/features/employees/employee.routes.js`

Declara las rutas HTTP de la feature y las enlaza con sus controladores.

### `backend/src/routes/api.routes.js`

Registra `employeeRoutes` bajo `/api/employees`.

### `backend/src/database/seed.js`

Genera datos falsos para desarrollo local:

- 3 administradores RRHH.
- 100 empleados informaticos.
- Saldos iniciales simulados.
- Areas y cargos variados.

El seed reemplaza los empleados existentes para mantener una base demostrativa consistente.
