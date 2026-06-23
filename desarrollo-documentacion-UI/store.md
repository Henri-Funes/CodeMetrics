# Store UI (Módulo de Tienda)

Este módulo permite a los empleados gastar sus Puntos de Mérito canjeando premios.

## Vistas y Componentes

### 1. `StoreCatalog`
- **Uso:** Vitrina virtual de premios disponibles.
- **Componentes:**
  - `Row` y `Col` (Grid de AntD): Para crear un layout responsivo (ej. 3 columnas de premios).
  - `Card`: Cada premio es una tarjeta (`Card.Meta` para título y descripción). Tienen hover effects marcados, bordes anchos (2px a 3px) y sombras sólidas (Carton Style).
  - `Badge` (Ribbon): Para destacar artículos "Nuevo" o "Poco Stock".

### 2. `CheckoutDrawer` (Confirmación de Canje)
- **Uso:** Evita recargar o cambiar de página al querer canjear un premio.
- **Componentes:**
  - `Drawer`: Panel lateral que se desliza desde la derecha al hacer clic en "Canjear" en un premio.
  - `Descriptions` / `Statistic`: Dentro del Drawer, muestra "Saldo Actual", "Costo del Premio", y "Saldo Restante Estimado".
  - `Result`: Al confirmar la compra exitosamente, el contenido del Drawer cambia a un estado de éxito (`Result` component de AntD) con un botón para "Cerrar" o "Ir a Billetera".
