export type UserLayoutMode = 'legacy' | 'pro' | 'lite'

export type LayoutModeOption = {
  label: string
  value: UserLayoutMode
  description: string
}

export const layoutModeOptions: LayoutModeOption[] = [
  {
    label: 'Legacy',
    value: 'legacy',
    description: 'Vista amplia y clasica con mas contexto visible en pantalla.',
  },
  {
    label: 'Pro',
    value: 'pro',
    description: 'Balance general entre densidad, navegacion y visibilidad.',
  },
  {
    label: 'Lite',
    value: 'lite',
    description: 'Shell mas compacta con menos ruido visual en encabezados.',
  },
]

export function normalizeLayoutMode(value: unknown, fallback: UserLayoutMode = 'pro'): UserLayoutMode {
  if (typeof value !== 'string') return fallback

  const normalized = value.trim().toLowerCase()

  if (normalized === 'legacy' || normalized === 'pro' || normalized === 'lite') {
    return normalized
  }

  return fallback
}
