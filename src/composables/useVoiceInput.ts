import { ref, onUnmounted } from 'vue'

export function useVoiceInput() {
  const transcript = ref('')
  const isRecording = ref(false)
  const error = ref<string | null>(null)
  let recognition: SpeechRecognition | null = null

  function start() {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition })
        .webkitSpeechRecognition
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
    recognition.onresult = (event) => {
      transcript.value = event.results[0][0].transcript
    }
    recognition.onerror = (event) => {
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
