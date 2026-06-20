/**
 * Feature flags — valores base en este archivo.
 * Sobrescribibles por VITE_FF_* en .env para activar/desactivar sin deploy.
 *
 * Uso: const { flags } = useFeatureFlags()
 *      v-if="flags.advisor"
 */

const envFlag = (key: string, fallback: boolean): boolean => {
  const raw = import.meta.env[`VITE_FF_${key.toUpperCase()}`]
  if (raw === undefined || raw === '') return fallback
  return raw === '1' || raw === 'true'
}

export interface FeatureFlags {
  advisor: boolean       // Asesor IA (chat con AI)
  dreams: boolean        // Módulo Sueños
  proMode: boolean       // Layout Pro habilitado
  bulkImport: boolean    // Importación masiva CSV/Excel
  androidBuild: boolean  // Build Capacitor Android
}

const flags: FeatureFlags = {
  advisor:     envFlag('advisor',      true),
  dreams:      envFlag('dreams',       true),
  proMode:     envFlag('pro_mode',     true),
  bulkImport:  envFlag('bulk_import',  true),
  androidBuild: envFlag('android',     false),
}

export function useFeatureFlags() {
  return { flags }
}
