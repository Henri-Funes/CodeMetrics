# Wallet UI (Módulo de Billetera)

Este módulo gestiona la visibilidad detallada de las transacciones (ingresos por mérito y egresos por tienda) del empleado.

## Vistas y Componentes

### 1. `WalletHistory`
- **Uso:** Ver el libro mayor de puntos de un empleado.
- **Componentes:**
  - `Table`: Una tabla paginada con las columnas: Fecha, Concepto, Puntos, Saldo Post-Transacción.
  - `Tag`: Etiquetas de AntD para indicar el tipo de transacción:
    - `Tag` verde para ingresos (Ej: `performance_bonus`).
    - `Tag` rojo o naranja para egresos (Ej: `store_redemption`).
  - `Empty`: Si un empleado nuevo no tiene transacciones, se usa el componente Empty de AntD pero estilizado para que coincida con el tema oscuro.
