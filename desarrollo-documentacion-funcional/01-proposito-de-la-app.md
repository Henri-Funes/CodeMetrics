# ¿Para qué es la app?

## Propósito de negocio (SGDLI)

**CodeMetrics** es una plataforma web académica del **Sistema de Gestión del Desempeño e Incentivos Laborales (SGDLI)**. Simula cómo una empresa de tecnología (CodeMetrics) gestiona el rendimiento de sus equipos IT y convierte ese desempeño en incentivos concretos.

En términos simples, la app responde a esta pregunta de negocio:

> *¿Cómo reconocemos y premiamos el buen trabajo de desarrolladores y personal técnico de forma medible, trazable y motivadora?*

## Problema que resuelve

En equipos de software es común que el esfuerzo individual quede diluido en entregas, tickets y objetivos mensuales. Los sistemas tradicionales de RRHH suelen ser genéricos y poco adaptados al contexto IT.

SGDLI propone un ciclo digital:

1. **Medir** desempeño con indicadores claros (KPIs).
2. **Convertir** ese desempeño en puntos internos (Puntos de Mérito).
3. **Canjear** esos puntos por recompensas reales de la empresa.
4. **Supervisar** el proceso desde RRHH o liderazgo técnico.

## A quién está dirigida

| Rol | Quién representa | Qué hace en la app |
|-----|------------------|--------------------|
| **Empleado** (`employee`) | Desarrollador, QA, DevOps, etc. | Consulta su evaluación, saldo de puntos, historial y tienda de recompensas |
| **Administrador** (`admin`) | RRHH o liderazgo técnico | Gestiona catálogo, canjes, métricas globales y ajustes de billetera |

## Qué cubre el MVP actual

El MVP académico implementa el **núcleo del ciclo incentivo**:

- Evaluación mensual por KPIs.
- Cálculo automático de nota y puntos.
- Billetera con historial auditable.
- Tienda de recompensas y flujo de canje con aprobación.
- Dashboard administrativo con métricas operativas.

## Qué no cubre (alcance fuera del MVP)

Para no confundir expectativas, este MVP **no** implementa aún:

- Planificación formal de objetivos asignados por líder (módulo de metas).
- Autoevaluación y revisión del supervisor como flujo separado.
- Integración con sistemas reales de tickets (Jira, GitLab, etc.).
- Autenticación corporativa real (login con credenciales).
- Pagos económicos reales de bonos.

Esos puntos pueden formar parte de la **visión completa** del SGDLI, pero el demo actual se centra en demostrar el ciclo **evaluación → puntos → recompensas**.

## Contexto académico

Los datos de empleados, evaluaciones, premios y transacciones se generan con **semillas (seed)** para simular una empresa IT sin depender de sistemas externos. Esto permite demostrar reglas de negocio, trazabilidad y experiencia de usuario en un entorno controlado.

## Valor para la organización simulada

- **Transparencia:** cada punto tiene origen (evaluación, canje, ajuste).
- **Motivación:** el desempeño se traduce en beneficios tangibles.
- **Gestión:** RRHH puede aprobar canjes, administrar catálogo y ver indicadores globales.
- **Cultura de mejora:** los KPIs refuerzan calidad, entrega, colaboración e innovación.
