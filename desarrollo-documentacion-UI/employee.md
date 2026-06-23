# Employee UI (Módulo Empleado)

Este módulo contiene el Dashboard principal para los empleados y desarrolladores, donde consultan su desempeño.

## Vistas y Componentes

### 1. `EmployeeDashboard`
- **Uso:** Pantalla principal al iniciar sesión como empleado.
- **Componentes:**
  - `Card` (Neobrutalism Style): Tarjeta principal mostrando el mes actual (`PerformancePeriod`).
  - `Progress`: Círculos o barras de progreso de AntD mostrando la nota final de desempeño (0-100) y el desglose de sus KPIs (Calidad, Entrega, Bugs, etc.). Se usarán colores contrastantes (Verde neón para >80, Amarillo para >60, Rojo neón para <60).
  - `Statistic`: Resaltado de los `pointsAwarded` ganados en el último periodo.
  - `Timeline`: Un componente visual de AntD para mostrar brevemente el historial de notas pasadas mes a mes.
