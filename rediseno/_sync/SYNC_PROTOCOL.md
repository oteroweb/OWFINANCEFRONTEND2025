# SYNC_PROTOCOL — cómo se mantienen alineados el proyecto Claude Design y el espejo `rediseno/`

> Este archivo existe en AMBOS lados (espejo git y proyecto de Claude Design).
> Define el único mecanismo por el que "cambié algo en el diseño" se convierte en
> un diff visible, versionado y adjudicable — sin depender de la memoria de nadie.

## Los dos lados y quién es dueño de qué

| Lado | Dueño de | Nunca decide sobre |
|---|---|---|
| Proyecto Claude Design | presentación, interacción, exploración visual | shapes de datos, mecánicas de negocio |
| Repo Vue (`rediseno/` + `src/`) | shapes (interfaces TS), mecánicas (`BEHAVIOR.md`), adjudicaciones (`DECISIONS.md`) | — |

## Archivos del canal `_sync/`

- `_sync/CHANGELOG.jsonl` — **journal de cambios del lado del diseño**. Una línea JSON
  por cambio: `{"ts":"<ISO>","who":"design","files":["path1","path2"],"note":"qué y por qué"}`.
  El agente del repo agrega marcadores `{"type":"sync","ts":"<ISO>","commit":"<sha>"}`
  después de cada pull: las entradas posteriores al último marcador son lo pendiente.
- `_sync/MANIFEST.json` — copia del `SYNC_MANIFEST.json` del espejo al momento del
  último pull (hash sha256 por archivo). Solo lo escribe el agente del repo.

## Obligaciones del agente de Claude Design (lado diseño)

1. Antes de generar o modificar componentes: leer `DESIGN_CONTRACT.md`,
   `data/sample-data.contract.js`, `BEHAVIOR.md` y `DECISIONS.md`.
2. Después de CUALQUIER cambio de archivos: agregar la línea correspondiente a
   `_sync/CHANGELOG.jsonl`. Sin excepción — es lo que hace posible el pull selectivo.
3. Antes de rediseñar una vista listada en `views-registry.json` con estado
   `accepted-ported` o `superseded-by-vue`: proponer el cambio (nota en el changelog
   con `"proposal": true`), no bifurcar en silencio.
4. Nunca editar `_sync/MANIFEST.json` ni los archivos generados (`data/sample-data.contract.js`).

## Ciclo de pull (lado repo — automatizado por la skill `/rediseno-sync`)

1. `DesignSync get_file _sync/CHANGELOG.jsonl` → entradas después del último marcador
   de sync = archivos candidatos. `list_files` → altas/bajas estructurales.
2. `get_file` selectivo de los candidatos → `rediseno/.sync-staging/` (gitignored).
3. `node rediseno/tools/design-diff.mjs --listing <listing.json> --staging rediseno/.sync-staging`
   → escribe `SYNC_REPORT.md`. Los cambios que tocan vistas ya portadas salen marcados ⚠.
4. Cada ⚠ exige disposición en `DECISIONS.md` (design-gana / vue-gana / fusionar /
   intencionalmente-distintos) ANTES de portar. Preguntar al usuario, no asumir.
5. Aplicar los cambios aceptados al espejo → `node rediseno/tools/sync-manifest.mjs`
   → commit. El `git diff` de ese commit ES el informe de qué cambió.
6. Cerrar el ciclo remoto: `write_files` de `_sync/MANIFEST.json` actualizado +
   marcador de sync agregado a `_sync/CHANGELOG.jsonl`.

## Fallback si el changelog parece incompleto

Si hay indicios de cambios no registrados (fechas del proyecto más nuevas que el
último sync sin entradas nuevas), hacer un full-scan: `get_file` de los archivos de
texto del área sospechosa y comparar por hash contra `SYNC_MANIFEST.json`. Es caro —
por eso la obligación 2 del lado diseño importa.
