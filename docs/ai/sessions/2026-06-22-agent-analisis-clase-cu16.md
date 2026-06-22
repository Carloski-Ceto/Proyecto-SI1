# Sesión de Análisis de Clase - Caso de Uso 16: Emitir Receta de Medicamentos (Revisión UML)
**Fecha:** 2026-06-22  
**Agente:** Antigravity (Gemini 3.5 Flash)  

## Objetivo
Actualizar y rediseñar por completo el análisis de clases para el Caso de Uso 16: **Emitir receta de medicamentos** en Enterprise Architect bajo el nuevo paquete `"Analisis de Clase CU16"` (ID: 12), adaptándolo al estilo de representación UML de rectángulos tradicionales (sin usar iconos de robustez circulares) y detallando las propiedades específicas de configuración del backend de Django (viewsets, serializers, filters) y modelos del sistema.

## Contexto de Análisis y Mapeo con el Código
El nuevo diagrama se diseñó utilizando rectángulos tradicionales estereotipados en español e inglés, mapeando con precisión los elementos físicos del sistema:

1. **`UI Recetas` (`<<interface>>`)** - ID: 73: Interfaz Next.js para la emisión de recetas.
2. **`RecetaController` (`<<Controller>>`)** - ID: 74: Viewset Django (`RecetaMedicamentoViewSet`) detallando variables de clase del framework (queryset, serializers, filters, permissions).
3. **`HistorialClinico` (`<<Entidad>>`)** - ID: 75: Modelo de Django para los expedientes médicos.
4. **`RecetaMedicamento` (`<<Entidad>>`)** - ID: 76: Modelo de Django para las recetas y detalles de fármacos.
5. **`Bitácora` (`<<Entidad>>`)** - ID: 77: Registro de auditoría del sistema.
6. **`AccionBitacora` (`<<enumeration>>`)** - ID: 78: Enumeración de Django (`models.TextChoices`) de las acciones auditables del sistema.
7. **`Médico Especialista` (`Actor`)** - ID: 79: Actor principal que interactúa con la interfaz.

---

## Estructura de las Clases en el Modelo

### 1. `UI Recetas` (`<<interface>>`)
*   **Atributos**:
    *   `+ id_paciente: Long`
    *   `+ id_consulta: Long`
    *   `+ medicamentos: JSON`
    *   `+ indicaciones: String`
*   **Operaciones**:
    *   `+ capturarDatosReceta(): void`
    *   `+ confirmarRegistro(): void`
    *   `+ mostrarHistorialRecetas(): void`
    *   `+ mostrarMensajeError(): void`
    *   `+ seleccionarPaciente(): void`
    *   `+ solicitarDatosReceta(): void`

### 2. `RecetaController` (`<<Controller>>`)
*   **Atributos de Configuración Django (Backend)**:
    *   `+ queryset: RecetaMedicamento.objects`
    *   `+ serializer_class: RecetaMedicamentoSerializer`
    *   `+ permission_classes: IsAuthenticated, IsMedicoOrAdminWrite...`
    *   `+ filterset_fields: id_consulta, registrado_por`
    *   `+ ordering_fields: fecha_creacion`
*   **Operaciones**:
    *   `+ list(): void`
    *   `+ create(): void`
    *   `+ retrieve(): void`
    *   `+ update(): void`
    *   `+ destroy(): void`
    *   `+ get_queryset(): QuerySet`
    *   `+ perform_create(): void`
    *   `+ perform_update(): void`
    *   `+ perform_destroy(): void`

### 3. `HistorialClinico` (`<<Entidad>>`)
*   **Atributos**:
    *   `+ id_historial: Long [PK]`
    *   `+ estado: String`
*   **Operaciones**:
    *   `+ es_activo(): Boolean`

### 4. `RecetaMedicamento` (`<<Entidad>>`)
*   **Atributos**:
    *   `+ id_receta: Long [PK]`
    *   `+ id_historial: Long [FK]`
    *   `+ id_consulta: Long [FK]`
    *   `+ medicamentos: JSON`
    *   `+ indicaciones: String`
    *   `+ registrado_por: Long [FK]`
    *   `+ fecha_creacion: DateTime`
    *   `+ fecha_actualizacion: DateTime`
*   **Operaciones**:
    *   `+ save(): void`
    *   `+ delete(): void`

### 5. `Bitácora` (`<<Entidad>>`)
*   **Atributos**:
    *   `+ id_bitacora: Long [PK]`
    *   `+ id_usuario: Long [FK]`
    *   `+ modulo: String`
    *   `+ accion: String`
    *   `+ tabla_afectada: String`
    *   `+ descripcion: String`
    *   `+ ip_origen: String`
    *   `+ fecha_registro: DateTime`
*   **Operaciones**:
    *   `+ registrar_accion(): void`

### 6. `AccionBitacora` (`<<enumeration>>`)
*   **Valores (Atributos)**:
    *   `LOGIN / LOGOUT`
    *   `LOGIN_FALLIDO`
    *   `CREAR / EDITAR / ELIMINAR`
    *   `CAMBIAR / RECUPERAR PASSWORD`
    *   `REPROGRAMAR / CANCELAR / CONFIRMAR`
    *   `ARCHIVAR / RESTAURAR`

---

## Relaciones Creadas
*   `Médico Especialista` -> `UI Recetas` (`Association`, Unspecified)
*   `UI Recetas` -> `RecetaController` (`Association`, Unspecified)
*   `RecetaController` -> `HistorialClinico` (`Association`, Unspecified)
*   `RecetaController` -> `RecetaMedicamento` (`Association`, Unspecified)
*   `RecetaController` -> `Bitácora` (`Association`, Unspecified)
*   `RecetaMedicamento` -> `HistorialClinico` (`Association`, Unspecified)
*   `Bitácora` -> `AccionBitacora` (`Dependency` etiquetada como `"Use"`, FromSourceToTarget)

---

## Verificación Visual y Consolidación
El diagrama de clases `"Model"` (ID: 14) dentro del paquete `"Analisis de Clase CU16"` (ID: 12) fue regenerado y guardado. Se comprobó visualmente que todos los elementos se representan mediante rectángulos clásicos con sus respectivos compartimentos de atributos y métodos, reflejando el mapeo técnico del backend de Django y frontend Next.js.
