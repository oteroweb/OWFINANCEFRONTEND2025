import { ref, onUnmounted } from 'vue'

// Web Speech API no está en los lib types estándar de TS; declaramos lo mínimo que usamos.
interface SpeechRecognitionResultEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}
interface SpeechRecognitionErrorEventLike {
  error: string
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type SpeechRecognitionCtorType = new () => SpeechRecognitionLike

export function useVoiceInput() {
  const transcript = ref('')
  const isRecording = ref(false)
  const error = ref<string | null>(null)
  let recognition: SpeechRecognitionLike | null = null

  function start() {
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtorType
      webkitSpeechRecognition?: SpeechRecognitionCtorType
    }
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      error.value = 'Tu dispositivo no soporta reconocimiento de voz'
      return
    }
    recognition = new SpeechRecognitionCtor()
    recognition.lang = 'es-MX'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      isRecording.value = true
    }
    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      transcript.value = event.results[0]![0]!.transcript
    }
    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      error.value = `Error de voz: ${event.error}`
      isRecording.value = false
    }
    recognition.onend = () => {
      isRecording.value = false
    }

    recognition.start()
  }

  function stop() {
    recognition?.stop()
    isRecording.value = false
  }

  onUnmounted(() => {
    recognition?.stop()
  })

  return { transcript, isRecording, error, start, stop }
}
