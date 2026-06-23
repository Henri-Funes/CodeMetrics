# ¿Cómo se usa en la demo?

Guía paso a paso para demostrar CodeMetrics en entorno local con Docker.

## Requisitos previos

- Docker y Docker Compose instalados.
- Proyecto clonado en la máquina local.

## 1) Levantar el entorno

Desde la raíz del proyecto:

```bash
docker compose up --build -d
docker compose ps
```

Servicios esperados:

| Servicio | URL / Puerto | Función |
|----------|--------------|---------|
| Frontend | `http://localhost:5173` | Interfaz React |
| Backend | `http://localhost:3000` | API Express |
| Health API | `http://localhost:3000/api/health` | Estado API y MongoDB |
| MongoDB | `localhost:27017` | Base de datos local |

## 2) Cargar datos de demostración (seed)

El seed **no** se ejecuta automáticamente al iniciar el servidor. Debe lanzarse manualmente:

```bash
docker compose exec backend npm run seed
```

Esto genera, entre otros:

- 3 administradores RRHH.
- 100 empleados IT activos.
- 6 periodos de desempeño mensuales.
- Evaluaciones con KPIs, notas y puntos calculados.
- Catálogo de recompensas y canjes de ejemplo.

## 3) Acceder a la aplicación

Abrir en navegador:

```text
http://localhost:5173
```

La ruta `/` redirige según el rol activo:

- **Admin** → `/admin`
- **Empleado** → `/dashboard`

Para verificar estado técnico (API + MongoDB):

```text
http://localhost:5173/status
```

## 4) Seleccionar usuario (sesión simulada)

En la barra superior, usar el selector de sesión:

1. Elegir rol: `Empleado` o `Admin`.
2. Elegir usuario concreto de la lista (datos reales del seed).

No hay login con contraseña: es una simulación académica de sesión.

---

## Demo como empleado (flujo recomendado)

### Paso A — Ver desempeño

1. Seleccionar un usuario con rol **employee**.
2. Ir a **Mi Desempeño** (`/dashboard`).
3. Revisar:
   - último periodo evaluado,
   - nota final (0–100),
   - KPIs (calidad, entrega, bugs, colaboración, innovación),
   - puntos ganados en el periodo,
   - historial mensual de evaluaciones.

### Paso B — Consultar billetera

1. En el header, abrir el widget de puntos (mini billetera).
2. Ir a **Billetera** (`/wallet`).
3. Verificar:
   - saldo actual,
   - puntos ganados y gastados,
   - tabla de transacciones con concepto y saldo posterior.

### Paso C — Canjear una recompensa

1. Ir a **Tienda** (`/store`).
2. Elegir un premio con stock y saldo suficiente.
3. Pulsar **Canjear**.
4. En el drawer:
   - confirmar saldo, costo y saldo estimado,
   - agregar nota opcional para RRHH,
   - confirmar solicitud.
5. Ver pantalla de éxito (`Result`) y opcionalmente ir a billetera.

Resultado esperado:

- Se crea un canje en estado `pending`.
- Se descuentan puntos del empleado.
- Se registra transacción `redemption_debit`.

---

## Demo como administrador (flujo recomendado)

### Paso D — Ver panorama general

1. Cambiar sesión a un usuario **admin**.
2. Ir a **Resumen** (`/admin`) desde el menú lateral.
3. Revisar:
   - totales de empleados,
   - puntos emitidos y score promedio,
   - top performers,
   - estado de periodos,
   - resumen de canjes por estado.

### Paso E — Gestionar catálogo de recompensas

1. Ir a **Gestión de Tienda** (`/admin/rewards`).
2. Probar:
   - filtros por categoría, disponibilidad y búsqueda,
   - crear o editar premio,
   - activar/desactivar premio.

### Paso F — Procesar canjes pendientes

1. Ir a **Canjes Pendientes** (`/admin/redemptions`).
2. Por defecto se muestran canjes `pending`.
3. Para cada ticket:
   - **Aprobar** → pasa a `approved`,
   - **Rechazar** → pasa a `rejected` y reembolsa puntos,
   - si ya está aprobado → **Marcar entregado** (`delivered`).

### Paso G — Operaciones de billetera (opcional)

1. Ir a **Billetera** (`/admin/wallet`).
2. Opciones:
   - **Ajuste manual** de puntos a un empleado (+/-),
   - **Abonar bonos** de un periodo completo (convierte evaluaciones pendientes en transacciones).

---

## Escenario de demo sugerido (5–8 minutos)

1. Mostrar `/status` (sistema operativo).
2. Entrar como empleado → dashboard + KPIs.
3. Canjear un premio en tienda.
4. Cambiar a admin → ver canje pendiente.
5. Aprobar o rechazar canje.
6. Volver como empleado → validar saldo/historial actualizado.

## Comandos útiles de soporte

```bash
# Ver logs
docker compose logs -f

# Reiniciar servicios
docker compose restart

# Detener entorno
docker compose down
```

## Limitaciones de la demo

- Los KPIs y evaluaciones vienen del seed, no de tickets reales.
- La sesión es simulada (selector de usuario).
- No hay notificaciones push ni tiempo real con WebSockets.
- Algunas operaciones de RRHH sobre empleados existen en API pero no tienen pantalla dedicada en frontend.
