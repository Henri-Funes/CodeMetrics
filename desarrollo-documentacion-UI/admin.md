# Admin UI (Módulo Administrador)

Este módulo contiene las vistas exclusivas para los perfiles administrativos (RRHH o Liderazgo).

## Vistas y Componentes

### 1. `AdminDashboard`
- **Uso:** Pantalla principal del administrador para ver métricas globales.
- **Componentes:**
  - `Layout.Sider`: Un menú lateral izquierdo (`Menu` de AntD) para navegar entre "Resumen", "Gestión de Tienda" y "Canjes Pendientes". Desacoplamos así la carga visual.
  - `Statistic` y `Card`: Tarjetas gruesas ("Carton Style") mostrando totales (Total Empleados, Puntos Emitidos, etc.).
  - `Table`: Una tabla con los Top Performers del último periodo evaluado.

### 2. `AdminRewardsManager` (Gestión de Tienda)
- **Uso:** CRUD para los premios del catálogo.
- **Componentes:**
  - `Table`: Lista de recompensas actuales.
  - `Button` (Primary): Botón de "Agregar Premio" con bordes gruesos.
  - `Modal` / `Form`: Formulario emergente para crear o editar un premio (nombre, costo en puntos, stock).

### 3. `AdminRedemptionsManager` (Gestión de Canjes)
- **Uso:** Para que RRHH marque como "entregados" los premios solicitados.
- **Componentes:**
  - `Table` / `List`: Lista de canjes en estado "pending".
  - `Popconfirm`: Al hacer clic en "Marcar Entregado", sale un pequeño tooltip pidiendo confirmación para evitar clics accidentales.
