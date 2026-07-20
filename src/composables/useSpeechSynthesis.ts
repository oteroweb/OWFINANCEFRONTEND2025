// OWF-319 (capa 2): TTS nativo del navegador para leer en voz alta la pregunta de cuenta
// faltante (slot-filling). A diferencia de SpeechRecognition (input de voz, migrado a
// server-side en OWF-311 porque Brave la bloquea y iOS Safari nunca la implementó),
// speechSynthesis SÍ tiene soporte amplio incluyendo iOS Safari — no requiere red ni
// credenciales de un proveedor externo, así que se usa tal cual sin fallback a un
// proveedor de pago. Si el navegador no lo soporta, es un no-op silencioso: el flujo
// sigue funcionando solo con el selector visual de chips (nunca bloquea nada).
export function useSpeechSynthesis() {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  function speak(text: string) {
    if (!isSupported) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-VE'
      window.speechSynthesis.speak(utterance)
    } catch {
      // No-op — la pregunta sigue visible como texto y chips, la voz es un extra.
    }
  }

  function stop() {
    if (!isSupported) return
    window.speechSynthesis.cancel()
  }

  return { isSupported, speak, stop }
}
