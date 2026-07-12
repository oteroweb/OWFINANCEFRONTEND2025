---
name: rediseno-sync
description: Ejecuta el ciclo de sincronización entre el proyecto de Claude Design "rediseno" (MCP DesignSync, projectId 5fd9e16d-4e55-4813-8714-3dd0f0a35c48) y el espejo rediseno/ del repo. Usar cuando el usuario diga que cambió algo en el diseño, pida "traer los cambios del diseño", pida el diff diseño↔espejo, o toque actualizar el contrato/manifest del lado del diseño.
---

# /rediseno-sync — ciclo de sincronización Claude Design ↔ espejo

Protocolo completo: `rediseno/_sync/SYNC_PROTOCOL.md`. Este skill lo ejecuta paso a paso.
ProjectId del diseño: `5fd9e16d-4e55-4813-8714-3dd0f0a35c48`.

## Pasos

1. **Detectar candidatos.**
   - `DesignSync get_file` de `_sync/CHANGELOG.jsonl` → las entradas posteriores al
     último marcador `{"type":"sync",...}` listan los archivos tocados del lado diseño.
   - `DesignSync list_files` → guardar el array de paths como JSON en un archivo
     temporal (scratchpad), p. ej. `listing.json`.

2. **Pull selectivo a staging.** `get_file` SOLO de los candidatos de texto (nunca el
   proyecto completo; cap 256 KiB/archivo) y escribirlos con sus paths relativos bajo
   `rediseno/.sync-staging/` (está gitignored).

3. **Diff.** `node rediseno/tools/design-diff.mjs --listing <listing.json> --staging rediseno/.sync-staging`
   - Genera `rediseno/SYNC_REPORT.md` con altas / bajas / modificados.
   - Exit code 2 = hay cambios que tocan vistas `accepted-ported` / `superseded-by-vue`
     / `divergent-*` según `rediseno/views-registry.json`.

4. **Adjudicación (bloqueante).** Por cada cambio marcado ⚠ en el reporte: preguntar
   al usuario la disposición (design-gana / vue-gana / fusionar /
   intencionalmente-distintos) con AskUserQuestion y registrar el asiento en
   `rediseno/DECISIONS.md` + actualizar el estado de la vista en `views-registry.json`.
   PROHIBIDO portar o excluir en silencio una colisión.

5. **Aplicar y versionar.** Copiar los cambios aceptados de staging al espejo,
   borrar staging, y correr:
   - `node rediseno/tools/sync-manifest.mjs`
   - `node rediseno/tools/check-views.mjs`
   - `node rediseno/tools/generate-fixtures.mjs --check` (si cambió algo de datos)
   Commitear. El `git diff` del commit es el informe real de qué cambió en el diseño.

6. **Cerrar el ciclo remoto.** Vía `DesignSync finalize_plan` + `write_files`
   (localDir `rediseno/`):
   - `_sync/MANIFEST.json` ← copia del `SYNC_MANIFEST.json` recién generado.
   - `_sync/CHANGELOG.jsonl` ← el remoto + marcador `{"type":"sync","ts":...,"commit":"<sha>"}`.
   - Si cambiaron: `DESIGN_CONTRACT.md`, `data/sample-data.contract.js`, `BEHAVIOR.md`,
     `DECISIONS.md`, `views-registry.json` (la verdad del frontend viaja al diseño).

7. **Port a Vue.** Con el espejo actualizado, portar según `rediseno/INSTRUCTIVO.md`
   (§5 flujo y §6 principios innegociables). Al terminar un port, actualizar el estado
   de la vista en `views-registry.json` a `accepted-ported`.

## Reglas duras

- El cántaro se deriva de la categoría — cualquier JSX con selector de jar se rechaza.
- Nada se porta si su vista está `divergent-pending-decision`.
- No inventar shapes: solo los `window.SAMPLE_*` del contrato.
- `rediseno/.sync-staging/` nunca se commitea.
