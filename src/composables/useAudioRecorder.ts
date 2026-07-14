import { ref, onUnmounted } from 'vue'

// OWF-311: reemplaza useVoiceInput.ts (Web Speech API nativa del navegador) como fuente
// de captura de voz. SpeechRecognition/webkitSpeechRecognition no es confiable cross-browser
// — Brave bloquea su backend por privacidad ("Error de voz: network"), Edge no trae las
// credenciales privadas de Google que necesita, y Safari/iOS nunca lo implementó. MediaRecorder
// es un estándar web soportado en todos esos entornos (incluyendo el WebView de Capacitor en
// iOS) — graba el audio crudo y lo manda al servidor, que transcribe vía Groq Whisper
// (AiProviderFactory::transcribeAudio) en vez de depender del navegador.
export function useAudioRecorder() {
  const isRecording = ref(false)
  const audioBase64 = ref<string | null>(null)
  const mimeType = ref('audio/webm')
  const error = ref<string | null>(null)

  let mediaRecorder: MediaRecorder | null = null
  let stream: MediaStream | null = null
  let chunks: Blob[] = []
  let stopResolve: ((value: string | null) => void) | null = null

  function pickMimeType(): string {
    const candidates = ['audio/webm', 'audio/mp4', 'audio/ogg']
    for (const candidate of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(candidate)) {
        return candidate
      }
    }
    return 'audio/webm'
  }

  async function start() {
    error.value = null
    audioBase64.value = null
    chunks = []

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      error.value = 'Tu dispositivo no soporta grabación de audio'
      return
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      error.value = 'No se pudo acceder al micrófono. Revisa los permisos.'
      return
    }

    const type = pickMimeType()
    mimeType.value = type

    try {
      mediaRecorder = new MediaRecorder(stream, { mimeType: type })
    } catch {
      mediaRecorder = new MediaRecorder(stream)
      mimeType.value = mediaRecorder.mimeType || 'audio/webm'
    }

    mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType.value })
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1] ?? null
        audioBase64.value = base64
        stopResolve?.(base64)
        stopResolve = null
      }
      reader.readAsDataURL(blob)
      stream?.getTracks().forEach((track) => track.stop())
      stream = null
    }

    mediaRecorder.start()
    isRecording.value = true
  }

  /** Detiene la grabación y espera a que el audio termine de codificarse a base64. */
  function stop(): Promise<string | null> {
    isRecording.value = false
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      return Promise.resolve(null)
    }
    return new Promise((resolve) => {
      stopResolve = resolve
      mediaRecorder?.stop()
    })
  }

  onUnmounted(() => {
    stream?.getTracks().forEach((track) => track.stop())
  })

  return { isRecording, audioBase64, mimeType, error, start, stop }
}
