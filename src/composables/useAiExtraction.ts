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
    date: string | null
    confidence: number | null
  }
  processing_ms: number
  /** OWF-311: presente cuando source=voice — el texto que Groq Whisper transcribió del audio. */
  transcript?: string | null
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

  return { loading, error, retryCount, retrying, extractFromText, extractFromAudio }
}
