import { ref } from 'vue'
import { api } from 'src/boot/axios'

export interface ExtractionResult {
  extraction_id: number
  data: {
    type: 'expense' | 'income' | 'transfer' | null
    amount: number | null
    currency: string | null
    description: string | null
    category_suggestion: string | null
    /** OWF-316: nombre de comercio detectado por la IA, antes de resolver contra providers reales. */
    merchant?: string | null
    /** OWF-316: provider real del usuario resuelto por similitud contra `merchant` (backend). */
    provider_id_suggestion?: number | null
    provider_name_suggestion?: string | null
    date: string | null
    confidence: number | null
    /** OWF-317: equivalente en la moneda local a la tasa oficial (BCV) del usuario, cuando amount/currency vienen en USD. */
    bcv_equivalent?: number | null
    bcv_currency_code?: string | null
    bcv_rate?: number | null
    /** OWF-319 (capa 1): cuenta resuelta automáticamente (1 sola cuenta o match por nombre), o null si falta. */
    account_id?: number | null
  }
  processing_ms: number
  /** OWF-311: presente cuando source=voice — el texto que Groq Whisper transcribió del audio. */
  transcript?: string | null
  /** OWF-319 (capa 1): campos que el usuario debe completar antes de poder confirmar (hoy solo "account_id"). Vacío = ya se puede confirmar. */
  missing_fields?: string[]
  missing_field_options?: {
    account_id?: { id: number; label: string; balance: number; currency: string }[]
  }
  /** OWF-319 (capa 3): true si el usuario dijo un comando de creación directa ("...crea
   *  directo") Y no falta ningún campo — el frontend guarda sin pasar por la revisión editable. */
  direct_create?: boolean
}

function mapHttpError(status: number): string {
  switch (status) {
    case 429: return 'Límite de uso alcanzado. Espera unos minutos.'
    case 503: return 'Servicio IA no disponible. Intenta más tarde.'
    case 422: return 'Datos inválidos para procesar.'
    default:  return 'Error al procesar con IA. Intenta de nuevo.'
  }
}

export function useAiExtraction() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const retryCount = ref(0)
  const retrying = ref(false)

  async function post(payload: Record<string, unknown>): Promise<ExtractionResult | null> {
    loading.value = true
    error.value = null
    retryCount.value = 0
    retrying.value = false

    const attempt = async (): Promise<ExtractionResult | null> => {
      try {
        const { data } = await api.post<ExtractionResult>('/ai/extract-transaction', payload)
        return data
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status
        const isNetworkError = !status

        if (isNetworkError && retryCount.value < 1) {
          retryCount.value++
          retrying.value = true
          await new Promise<void>((resolve) => setTimeout(resolve, 1000))
          retrying.value = false
          return attempt()
        }

        error.value = mapHttpError(status ?? 0)
        return null
      }
    }

    try {
      return await attempt()
    } finally {
      loading.value = false
      retrying.value = false
    }
  }

  function extractFromText(
    source: 'voice' | 'ocr' | 'auto',
    input: string,
    image?: string
  ): Promise<ExtractionResult | null> {
    const payload: Record<string, unknown> = { source, input }
    if (image) payload.image = image
    return post(payload)
  }

  /** OWF-311: source siempre 'voice' — manda el audio grabado (MediaRecorder) para que
   *  el servidor lo transcriba (Groq Whisper) en vez de depender de SpeechRecognition. */
  function extractFromAudio(audioBase64: string, mimeType: string): Promise<ExtractionResult | null> {
    return post({ source: 'voice', audio: audioBase64, audio_mime: mimeType })
  }

  /** OWF-319 (capa 1): resuelve un campo faltante (ej. tap en un chip de cuenta) — llama a
   *  un endpoint dedicado que NO invoca IA, así que no pasa por post()/retry de red (esa
   *  lógica es para llamadas que sí cuestan tokens); acá un simple try/catch alcanza. */
  async function answerMissingField(
    extractionId: number,
    field: 'account_id',
    value: number
  ): Promise<ExtractionResult | null> {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.post<ExtractionResult>(
        `/ai/extract-transaction/${extractionId}/answer`,
        { field, value }
      )
      return data
    } catch {
      error.value = 'No se pudo guardar la respuesta. Intenta de nuevo.'
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, retryCount, retrying, extractFromText, extractFromAudio, answerMissingField }
}
