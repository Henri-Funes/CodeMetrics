# Shared UI (Componentes Compartidos)

Este módulo contiene la estructura base y los componentes transversales utilizados en toda la aplicación. Todo se renderiza usando el "Carton Style Dark Mode" configurado en el `ConfigProvider` de Ant Design.

## Componentes Principales

### 1. `LayoutBase` (Layout de Ant Design)
- **Uso:** Es el contenedor principal (`Layout`, `Layout.Header`, `Layout.Content`, `Layout.Footer`).
- **Comportamiento:** Mantiene el Navbar fijo en la parte superior y renderiza las vistas dinámicas en el contenido usando React Router (`Outlet`).

### 2. `RoleSwitcher` (Select de Ant Design)
- **Uso:** Ubicado en el Navbar. Permite simular el cambio de sesión entre un "Admin" y un "Empleado".
- **Componente:** `Select` de AntD con un dropdown de opciones.
- **Interacción:** Al cambiar de usuario, actualiza el estado global (o el Contexto) y redirige al dashboard correspondiente (Admin o Employee).

### 3. `MiniWalletWidget` (Popover + Statistic de Ant Design)
- **Uso:** Ubicado en el Navbar, visible solo cuando el usuario activo es un "Empleado".
- **Componente:** 
  - Gatillo: Un botón estilizado mostrando el saldo actual de puntos.
  - Dropdown: Un `Popover` de AntD.
- **Interacción:** Al hacer clic o pasar el mouse por encima del saldo, se despliega el `Popover` mostrando las últimas 3 transacciones resumidas (usando una `List` simple) y un botón "Ver Billetera Completa" que redirige a `/wallet`.
