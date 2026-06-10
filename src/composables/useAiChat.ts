import { ref } from 'vue'
import { api } from 'src/boot/axios'

export interface ChatMessage {
  id?: number
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface Conversation {
  id: number
  title: string | null
  status: string
  total_messages: number
  last_message_at: string | null
}

export function useAiChat() {
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentConversationId = ref<number | null>(null)
  const isStreaming = ref(false)
  const lastUserMessage = ref<string | null>(null)

  async function sendMessage(text: string): Promise<void> {
    if (!text.trim() || isStreaming.value) return

    lastUserMessage.value = text

    // Add user message immediately
    messages.value.push({ role: 'user', content: text })

    // Add empty assistant message for streaming
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' }
    messages.value.push(assistantMsg)
    const assistantIndex = messages.value.length - 1

    isStreaming.value = true
    error.value = null

    try {
      // Use fetch directly for SSE (axios doesn't support streaming well)
      const baseUrl = api.defaults.baseURL ?? ''
      const token = api.defaults.headers.common['Authorization'] as string | undefined

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      }
      if (token) {
        headers['Authorization'] = token
      }

      const response = await fetch(`${baseUrl}/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text,
          ...(currentConversationId.value ? { conversation_id: currentConversationId.value } : {}),
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('RATE_LIMIT')
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? '' // keep incomplete line

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const json = JSON.parse(line.slice(6)) as {
                type: string
                text?: string
                conversation_id?: number
                message?: string
              }

              if (json.type === 'delta' && json.text) {
                messages.value[assistantIndex]!.content += json.text
              } else if (json.type === 'done' && json.conversation_id) {
                currentConversationId.value = json.conversation_id
              } else if (json.type === 'error') {
                error.value = json.message ?? 'Error del servidor'
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      } catch {
        // Stream disconnected mid-read
        error.value = 'Conexión interrumpida. Toca para reintentar.'
        messages.value.splice(assistantIndex, 1)
      }
    } catch (err: unknown) {
      const msg = (err as Error).message
      if (msg === 'RATE_LIMIT') {
        error.value = 'Límite de mensajes alcanzado. Espera unos minutos.'
      } else {
        error.value = 'Conexión interrumpida. Toca para reintentar.'
      }
      messages.value.splice(assistantIndex, 1) // remove empty assistant msg
    } finally {
      isStreaming.value = false
    }
  }

  async function retry(): Promise<void> {
    if (!lastUserMessage.value || isStreaming.value) return
    // Remove the last user message so sendMessage re-adds it
    const lastIdx = [...messages.value].reverse().findIndex((m) => m.role === 'user')
    if (lastIdx !== -1) {
      messages.value.splice(messages.value.length - 1 - lastIdx, 1)
    }
    error.value = null
    await sendMessage(lastUserMessage.value)
  }

  function clearConversation() {
    messages.value = []
    currentConversationId.value = null
    error.value = null
    lastUserMessage.value = null
  }

  async function loadConversation(id: number): Promise<void> {
    loading.value = true
    try {
      const { data } = await api.get<{ messages: ChatMessage[] }>(`/ai/conversations/${id}/messages`)
      messages.value = data.messages
      currentConversationId.value = id
    } catch {
      error.value = 'Error cargando conversación'
    } finally {
      loading.value = false
    }
  }

  async function getConversations(): Promise<Conversation[]> {
    const { data } = await api.get<Conversation[]>('/ai/conversations')
    return data
  }

  return {
    messages,
    loading,
    error,
    isStreaming,
    currentConversationId,
    lastUserMessage,
    sendMessage,
    retry,
    clearConversation,
    loadConversation,
    getConversations,
  }
}
