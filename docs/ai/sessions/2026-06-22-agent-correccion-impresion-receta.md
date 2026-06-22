# Sesión 2026-06-22 — Corrección de Impresión de Receta Médica

## Objetivo
Corregir el bug en la funcionalidad de impresión de recetas médicas (CU16) en Next.js (App Router), donde la receta no se visualizaba al intentar imprimir (página en blanco y desajustes de páginas adicionales).

## Causa Raíz
1. **Ocultamiento de ancestros en Next.js App Router:** 
   El CSS de impresión original ocultaba todos los hijos de `body` excepto `.printContainer` y `#print-area`. Como en Next.js la receta está anidada profundamente dentro del árbol de componentes, al aplicar `display: none` a los hijos directos del `body` se ocultaba el wrapper completo de la aplicación, desapareciendo la receta por herencia.
2. **Hasheo de ID por CSS Modules (BUG CRÍTICO):**
   Al simplificar el CSS de impresión utilizando el React Portal (para inyectar la receta directamente en `document.body` y ocultar el resto con `:global(body) > *:not(#print-area)`), el compilador de CSS Modules de Next.js procesaba el ID local `#print-area` y lo compilaba como `#page_print-area__hash` en el archivo CSS. Sin embargo, en el DOM del Portal en `page.tsx`, el ID se inyectaba de forma literal como `id="print-area"`. Al no coincidir el ID hasheado con el ID real del DOM, el navegador interpretaba que la receta coincidía con la negación `:not` y le aplicaba `display: none !important`, ocultando la receta por completo.
3. **Condición de carrera en React:**
   Llamar a `window.print()` síncronamente o en un delay demasiado bajo tras el cambio de estado no le permitía al navegador realizar el layout/paint visual en la pantalla antes de congelar el hilo principal, resultando en impresiones vacías.

## Solución Definitiva
1. **React Portal (`createPortal`):**
   - En [page.tsx](file:///e:/Clinica%20Ojos%20Norte/ClinicaOjosNorte/Proyecto-SI1/frontend/src/app/dashboard/recetas/page.tsx), se importó `createPortal` de `'react-dom'`.
   - Se modificó la renderización del área de impresión (`#print-area`) para inyectarla directamente como **hijo directo del `body`** (`document.body`) usando el Portal cuando `recetaToPrint` es válido.
2. **CSS de Impresión con ID Global:**
   - En [page.module.css](file:///e:/Clinica%20Ojos%20Norte/ClinicaOjosNorte/Proyecto-SI1/frontend/src/app/dashboard/recetas/page.module.css), se envolvió el selector en `:global` en el bloque de impresión:
     ```css
     :global(body) > *:not(:global(#print-area)) {
       display: none !important;
     }
     ```
     Esto previene que el procesador de CSS Modules le añada un hash dinámico, manteniendo el ID `#print-area` literal e intacto para que coincida perfectamente con el ID real del DOM.
3. **Control del Ciclo de Pintado (useEffect + setTimeout):**
   - Se utiliza un `useEffect` que escucha los cambios de `recetaToPrint`. Cuando se detecta la receta, se encola la ejecución de `window.print()` con un delay de `150ms` (`setTimeout`), permitiendo que el navegador complete la inyección del DOM, el procesamiento del CSS y el pintado (layout/paint) en pantalla antes de bloquear el hilo de ejecución.
   - Una vez que se cierra el cuadro de diálogo de impresión, se limpia el estado `recetaToPrint` volviéndolo a `null` de forma automática.
4. **Reinicio del Contenedor:**
   - Se ejecutó `docker compose restart frontend` para purgar la caché y compilar la lógica final sin hashes en el ID global.

## Archivos Afectados
- [page.tsx](file:///e:/Clinica%20Ojos%20Norte/ClinicaOjosNorte/Proyecto-SI1/frontend/src/app/dashboard/recetas/page.tsx) — Migración del área de impresión a `createPortal` y sincronización con el ciclo de vida de React.
- [page.module.css](file:///e:/Clinica%20Ojos%20Norte/ClinicaOjosNorte/Proyecto-SI1/frontend/src/app/dashboard/recetas/page.module.css) — Simplificación de `@media print` para ocultar todo excepto el Portal en la raíz utilizando selectores globales `:global(#print-area)`.
