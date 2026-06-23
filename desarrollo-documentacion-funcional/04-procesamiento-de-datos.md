# ¿Cómo se procesan los datos de punta a punta?

Narrativa del ciclo completo de datos en CodeMetrics, desde la carga inicial hasta el cierre de un canje.

---

## Vista general del ciclo

```text
[Seed] -> Empleados + Periodos + Evaluaciones + Premios
              |
              v
      Evaluacion (KPIs -> nota -> pointsAwarded)
              |
              v
      Wallet (abono opcional -> transaccion + saldo)
              |
              v
      Tienda (canje -> debito + ticket pending)
              |
              v
      RRHH (aprobar / rechazar / entregar)
```

La app separa responsabilidades:

- **Performance** calcula desempeño.
- **Wallet** mueve saldo con historial.
- **Rewards** define catálogo.
- **Redemptions** orquesta canjes y decisiones de RRHH.

---

## Fase 0 — Preparación de datos (seed manual)

**Cuándo ocurre:** al ejecutar `docker compose exec backend npm run seed`.

**Qué hace:**

1. Limpia y recrea empleados demo (admins + empleados IT).
2. Crea periodos mensuales (`PerformancePeriod`).
3. Genera evaluaciones (`PerformanceReview`) con KPIs aleatorios realistas.
4. Calcula `finalScore` y `pointsAwarded` con reglas de negocio.
5. Crea catálogo de recompensas (`Reward`).
6. Puede crear canjes y transacciones de ejemplo para poblar dashboards.

**Resultado:** MongoDB queda listo para demo sin intervención manual de carga.

**Regla importante:** el seed no corre al arrancar el servidor; es un paso explícito del operador.

---

## Fase 1 — Registro de personas (employees)

**Entidad:** `Employee`.

**Proceso funcional:**

1. RRHH da de alta colaboradores con rol, área y cargo.
2. Cada empleado inicia con `pointBalance` en 0 (o valor semilla).
3. Solo empleados activos (`isActive: true`) participan en evaluaciones y canjes.

**Uso en demo:** los empleados ya vienen del seed; el frontend selecciona uno para simular sesión.

---

## Fase 2 — Evaluación de desempeño (performance)

**Entidades:** `PerformancePeriod`, `PerformanceReview`.

### 2.1 Apertura de periodo

1. Se define un mes evaluado (ej. `2026-05`).
2. El periodo inicia en `draft` y puede pasar a `calculated` o `closed`.

### 2.2 Captura de KPIs

Para cada empleado activo se registra una evaluación con 5 KPIs (0–100):

- calidad, entrega, corrección de bugs, colaboración, innovación.

### 2.3 Normalización y cálculo

El backend:

1. Normaliza KPIs al rango válido.
2. Calcula `finalScore` con ponderaciones:
   - Calidad 30%, Entrega 25%, Bugs 20%, Colaboración 15%, Innovación 10%.
3. Convierte la nota en `pointsAwarded` según tabla de rangos.

### 2.4 Persistencia

Se guarda una `PerformanceReview` única por empleado y periodo.

**Salida de esta fase:** evaluación trazable con nota y puntos **calculados**, aún no necesariamente abonados al saldo.

### 2.5 Visualización empleado/admin

- Empleado ve último periodo, KPIs e historial mensual.
- Admin ve resumen global, top performers y estado de periodos.

---

## Fase 3 — Abono de puntos (wallet)

**Entidad:** `MeritTransaction`.

### 3.1 Por qué existe wallet

`pointBalance` en empleado sirve para consulta rápida, pero **no** debe cambiarse sin historial. Toda modificación pasa por transacciones.

### 3.2 Abono por evaluación

Cuando RRHH (o proceso automático) abona bonos:

1. Se toma una `PerformanceReview` con `pointsAwarded > 0`.
2. Se verifica que no exista abono duplicado para esa review.
3. Se crea transacción `performance_bonus`.
4. Se incrementa `pointBalance` del empleado.
5. Se guardan `balanceBefore` y `balanceAfter`.

También existe abono masivo por periodo (`grant-bonuses`) para todas las reviews pendientes del mes.

### 3.3 Ajuste manual

RRHH puede registrar `admin_adjustment` con puntos positivos o negativos y motivo explícito.

**Salida de esta fase:** saldo actualizado con auditoría completa en billetera.

---

## Fase 4 — Catálogo de incentivos (rewards)

**Entidad:** `Reward`.

**Proceso:**

1. Admin crea o edita premios con costo y stock.
2. Solo premios activos y con stock > 0 aparecen en catálogo empleado.
3. El catálogo es independiente de transacciones para mantener reglas claras.

**Salida:** vitrina de recompensas disponible en `/store`.

---

## Fase 5 — Solicitud de canje (redemptions + wallet)

**Entidad:** `Redemption`.

### 5.1 Validaciones previas

Al solicitar canje, el sistema verifica:

- empleado activo con rol `employee`,
- premio activo,
- stock disponible,
- saldo suficiente.

### 5.2 Reserva y débito

Si todo es válido:

1. Se descuenta 1 unidad de `stock` del premio.
2. Se crea ticket `Redemption` en estado `pending`.
3. Se guarda `rewardSnapshot` (precio/nombre al momento del canje).
4. `wallet` registra `redemption_debit` (puntos negativos).
5. Se actualiza `pointBalance` del empleado.

Si algo falla después de reservar, el sistema revierte creación y repone stock.

### 5.3 Experiencia empleado

En frontend, el drawer de tienda confirma saldo/costo y muestra resultado de éxito al completar la solicitud.

**Salida:** ticket pendiente de aprobación + saldo ya debitado temporalmente.

---

## Fase 6 — Decisión de RRHH (redemptions + wallet)

Admin procesa tickets desde bandeja de canjes.

### 6.1 Aprobar (`approved`)

- Cambia estado del ticket.
- No mueve puntos (ya fueron debitados al solicitar).
- Deja listo para entrega.

### 6.2 Rechazar (`rejected`)

1. Cambia estado a `rejected`.
2. `wallet` crea `redemption_refund` devolviendo `pointsSpent`.
3. Se repone stock del premio.

### 6.3 Entregar (`delivered`)

- Marca cumplimiento operativo del beneficio.
- Cierra el ciclo del canje aprobado.

**Salida:** historial coherente de decisión, saldo y stock.

---

## Fase 7 — Consulta y analítica operativa

### Empleado

- Dashboard de desempeño.
- Billetera con transacciones.
- Tienda y estado de canjes solicitados.

### Admin

- Resumen de empleados, desempeño y canjes.
- Gestión de catálogo.
- Bandeja de canjes por estado.
- Ajustes y abonos de billetera.

---

## Reglas de integridad del ciclo

1. **Una evaluación por empleado y periodo** (índice único).
2. **No abono duplicado** de la misma review.
3. **Toda variación de saldo** debe tener transacción asociada.
4. **Canje rechazado** siempre reembolsa puntos y repone stock.
5. **Snapshot de premio** preserva precio/nombre al momento del canje.

---

## Qué es simulado vs. real en el MVP

| Proceso | En MVP |
|---------|--------|
| Origen de KPIs | Simulado por seed |
| Evaluación mensual | Persistente en MongoDB |
| Cálculo de nota/puntos | Regla real de negocio |
| Movimiento de saldo | Regla real con historial |
| Canje y aprobación | Flujo real de estados |
| Integración con tickets reales | No implementada |
| Login corporativo | No implementado (sesión simulada) |

---

## Lectura rápida para defensa académica

CodeMetrics no solo “muestra pantallas”: implementa un **pipeline de datos con trazabilidad**:

1. mide desempeño,
2. traduce a incentivos,
3. permite canje controlado,
4. deja auditoría de cada movimiento,
5. habilita supervisión de RRHH sobre todo el ciclo.

Ese es el valor funcional central del SGDLI en su versión MVP.
