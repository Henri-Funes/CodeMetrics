# ¿Qué significan los datos?

Glosario funcional del dominio SGDLI en CodeMetrics.

---

## Conceptos generales

### SGDLI
Sistema de Gestión del Desempeño e Incentivos Laborales. Marco del proyecto académico.

### CodeMetrics (empresa simulada)
Organización ficticia de tecnología cuyos empleados son evaluados y pueden canjear Puntos de Mérito.

### Puntos de Mérito (Merit Points)
Moneda interna de la empresa. Se ganan por desempeño (u otros movimientos autorizados) y se gastan en la tienda de recompensas.

### Sesión simulada
Mecanismo de demo que permite elegir un empleado o admin del seed sin autenticación real.

---

## Personas y roles

### Employee (`employee`)
Colaborador IT evaluado por desempeño. Puede consultar KPIs, billetera y solicitar canjes.

Campos clave en `Employee`:

| Campo | Significado |
|-------|-------------|
| `name` | Nombre completo |
| `email` | Correo único de la persona |
| `role` | `employee` o `admin` |
| `department` | Área (ej. Desarrollo, QA, Infraestructura) |
| `position` | Cargo (ej. Backend Developer) |
| `pointBalance` | Saldo actual de puntos (consulta rápida) |
| `isActive` | Si puede operar en el sistema |

### Admin (`admin`)
Perfil de RRHH o liderazgo. Gestiona catálogo, canjes, métricas y ajustes.

---

## Desempeño y evaluación

### PerformancePeriod (Periodo de desempeño)
Mes evaluado (ej. `2026-05`). Agrupa evaluaciones de todos los empleados en ese ciclo.

| Campo | Significado |
|-------|-------------|
| `month`, `year`, `label` | Identificación del periodo |
| `status` | `draft`, `calculated`, `closed` |
| `calculatedAt` | Cuándo se calcularon evaluaciones |
| `closedAt` | Cuándo se cerró el periodo |

### PerformanceReview (Evaluación)
Resultado de desempeño de **un empleado** en **un periodo**.

| Campo | Significado |
|-------|-------------|
| `employeeId` | Empleado evaluado |
| `periodId` | Periodo al que pertenece |
| `kpis` | Métricas individuales (0–100) |
| `finalScore` | Nota final ponderada (0–100) |
| `pointsAwarded` | Puntos calculados por la nota |
| `notes` | Observación textual de la evaluación |

### KPI (Indicador clave de desempeño)
Métrica numérica de 0 a 100 usada para calcular la nota final.

| KPI | Significado funcional |
|-----|------------------------|
| `qualityScore` | Calidad del trabajo entregado |
| `deliveryScore` | Cumplimiento de entregas y plazos |
| `bugFixRate` | Efectividad corrigiendo errores |
| `collaborationScore` | Colaboración con el equipo |
| `innovationScore` | Aportes técnicos o mejoras propuestas |

### Regla de puntos por nota

| Nota final (`finalScore`) | Puntos otorgados (`pointsAwarded`) |
|---------------------------|-------------------------------------|
| 95 – 100 | 1000 |
| 90 – 94.99 | 800 |
| 80 – 89.99 | 600 |
| 70 – 79.99 | 350 |
| 60 – 69.99 | 150 |
| < 60 | 0 |

> Importante: `pointsAwarded` es un **cálculo** de la evaluación. El saldo real del empleado cambia cuando `wallet` registra una transacción de abono.

---

## Billetera y transacciones

### Wallet / Billetera
Conjunto de saldo + historial de movimientos de un empleado.

### MeritTransaction (Transacción de mérito)
Registro auditable de cada suma o resta de puntos.

| Campo | Significado |
|-------|-------------|
| `type` | Tipo de movimiento (ver tabla abajo) |
| `points` | Monto (+ suma, − resta) |
| `balanceBefore` | Saldo antes del movimiento |
| `balanceAfter` | Saldo después del movimiento |
| `reason` | Motivo legible |
| `sourceType` / `sourceId` | Origen del movimiento (evaluación, canje, ajuste) |
| `createdBy` | Usuario que originó la acción (si aplica) |

### Tipos de transacción

| Tipo | Significado |
|------|-------------|
| `performance_bonus` | Abono por evaluación de desempeño |
| `redemption_debit` | Descuento por solicitud de canje |
| `redemption_refund` | Devolución de puntos por canje rechazado |
| `admin_adjustment` | Ajuste manual de RRHH (+ o −) |

---

## Tienda y recompensas

### Reward (Recompensa / Premio)
Ítem del catálogo que el empleado puede canjear.

| Campo | Significado |
|-------|-------------|
| `name` | Nombre del premio |
| `description` | Detalle para el empleado |
| `category` | Tipo de beneficio |
| `costInPoints` | Precio en puntos |
| `stock` | Unidades disponibles |
| `isActive` | Si aparece en catálogo activo |

### Categorías de recompensa

| Categoría | Ejemplos típicos |
|-----------|------------------|
| `licenses` | Licencias de software (Copilot, JetBrains) |
| `training` | Cursos, certificaciones, mentorías |
| `hardware` | Teclado, monitor, silla ergonómica |
| `time` | Día libre, viernes corto |
| `wellness` | Bienestar, vouchers |

---

## Canjes

### Redemption (Ticket de canje)
Solicitud formal de un empleado para obtener una recompensa.

| Campo | Significado |
|-------|-------------|
| `employeeId` | Quién solicita |
| `rewardId` | Premio elegido |
| `rewardSnapshot` | Copia del premio al momento del canje |
| `pointsSpent` | Puntos descontados |
| `status` | Estado del ticket |
| `requestNote` | Nota del empleado |
| `decisionReason` | Motivo de decisión de RRHH |
| `reviewedBy` | Admin que procesó el ticket |

### Estados de canje

| Estado | Significado |
|--------|-------------|
| `pending` | Solicitado, esperando decisión de RRHH |
| `approved` | Aprobado, pendiente de entrega física/lógica |
| `rejected` | Rechazado; puntos reembolsados y stock repuesto |
| `delivered` | Premio entregado al empleado |

---

## Datos de resumen (dashboard admin)

### Employee Summary
Totales de personal: activos, inactivos, admins, empleados, saldo agregado.

### Performance Summary
Métricas de evaluaciones: promedio de score, puntos emitidos, top performers.

### Redemption Summary
Conteo y puntos por estado de canje (`pending`, `approved`, etc.).

---

## Datos técnicos de demo (seed)

Los datos iniciales son **ficticios** y se regeneran con `npm run seed`. Sirven para demostrar flujos sin conectar a ERP, nómina ni herramientas de tickets.

No deben interpretarse como datos reales de personas.
