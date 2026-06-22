# Sesión: Compatibilidad de opencode.jsonc con Antigravity (Windows)

Fecha: 2026-06-22

## Objetivo
Modificar el archivo `opencode.jsonc` para garantizar que los servidores MCP locales definidos en él puedan iniciarse de manera exitosa en entornos de Windows bajo el agente Antigravity.

## Cambios realizados
- **Archivo modificado:** [opencode.jsonc](file:///e:/Clinica%20Ojos%20Norte/ClinicaOjosNorte/Proyecto-SI1/opencode.jsonc).
- **Modificación:** Se reemplazó el comando `"npx"` por `"npx.cmd"` en la definición del servidor MCP local `drawio`.
- **Razón técnica:** En Windows, `npx` is un script de comandos por lotes (`npx.cmd`) y no un ejecutable PE ejecutable directamente de forma directa sin shell. Los agentes y motores de ejecución de MCP estrictos (como Antigravity y OpenCode) lanzan subprocesos directamente mediante llamadas nativas del sistema operativo para mitigar riesgos de seguridad por inyección en el shell. Esto causa un error de sistema `ENOENT` si se busca `"npx"` en Windows. Cambiar el comando a `"npx.cmd"` soluciona este comportamiento y levanta el servidor MCP local con éxito.
- **Validación:** Se ejecutó con éxito `opencode debug config` en el workspace del proyecto para verificar la validez del esquema y la correcta resolución de la configuración.
- **Documentación actualizada:**
  - `docs/ai/CURRENT_STATE.md`: se agregó el apartado de Integración de MCP y se actualizó la fecha de última actualización.
  - `docs/ai/HANDOFF_LATEST.md`: se incorporó la sección de actualización rápida con el cambio y su justificación técnica.
  - `docs/ai/NEXT_STEPS.md`: se marcó como completada la tarea de validación del CLI de OpenCode.
  - `docs/ai/DECISIONS_LOG.md`: se documentó la decisión técnica con el Registro 66.

## Próximos pasos
- Continuar con el desarrollo de los casos de uso pendientes utilizando las herramientas MCP locales (`drawio` y `enterprise-architect`) de forma fluida desde Antigravity en Windows.
